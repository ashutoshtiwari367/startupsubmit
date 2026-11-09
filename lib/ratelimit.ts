import { config, serverSecrets } from "@/lib/env/serverSecrets";

export const DEFAULT_MAX_REQUESTS_PER_HOUR = config.listingsRateLimitPerHour || 5;
export const DEFAULT_WINDOW_MS = config.listingsRateLimitWindowMs || 60 * 60 * 1000; // 1 hour

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  limitedBy?: "ip" | "email" | "fail_closed";
  key?: string;
}

export interface RateLimitStore {
  consume(
    key: string,
    maxRequests: number,
    windowMs: number,
    nowMs: number
  ): Promise<RateLimitResult> | RateLimitResult;
}

interface BucketEntry {
  timestamps: number[];
}

const memoryBuckets = new Map<string, BucketEntry>();

/**
 * Normalizes IP address and builds the per-IP rate-limit key.
 */
export function buildIpRateLimitKey(ip: string): string {
  const normalizedIp = String(ip || "")
    .trim()
    .toLowerCase();
  if (!normalizedIp) {
    return "";
  }
  return `rl:listings:ip:${normalizedIp}`;
}

/**
 * Normalizes email address and builds the per-email rate-limit key.
 */
export function buildEmailRateLimitKey(email: string): string {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  if (!normalizedEmail) {
    return "";
  }
  return `rl:listings:email:${normalizedEmail}`;
}

/**
 * Edge-compatible in-memory sliding-window store.
 */
export const memoryRateLimitStore: RateLimitStore = {
  consume(
    key: string,
    maxRequests: number,
    windowMs: number,
    nowMs: number = Date.now()
  ): RateLimitResult {
    if (!key || maxRequests <= 0 || windowMs <= 0) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: 60,
        limitedBy: "fail_closed",
        key,
      };
    }

    const bucket = memoryBuckets.get(key) || { timestamps: [] };

    // Evict timestamps outside the sliding window
    bucket.timestamps = bucket.timestamps.filter((ts) => nowMs - ts < windowMs);

    if (bucket.timestamps.length >= maxRequests) {
      const oldestInWindow = bucket.timestamps[0];
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((windowMs - (nowMs - oldestInWindow)) / 1000)
      );
      memoryBuckets.set(key, bucket);
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds,
        key,
      };
    }

    bucket.timestamps.push(nowMs);
    memoryBuckets.set(key, bucket);

    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - bucket.timestamps.length),
      retryAfterSeconds: 0,
      key,
    };
  },
};

/**
 * Upstash Redis REST / Edge KV sliding-window rate limiter using atomic pipeline.
 * Falls back to memoryRateLimitStore only when Upstash env vars are not configured;
 * if Upstash IS configured and fails or errors, it throws so the caller fails closed.
 */
export const upstashEdgeKvStore: RateLimitStore = {
  async consume(
    key: string,
    maxRequests: number,
    windowMs: number,
    nowMs: number = Date.now()
  ): Promise<RateLimitResult> {
    const restUrl = serverSecrets.upstashRedisRestUrl;
    const restToken = serverSecrets.upstashRedisRestToken;

    if (!restUrl || !restToken) {
      return memoryRateLimitStore.consume(key, maxRequests, windowMs, nowMs);
    }

    const windowStart = nowMs - windowMs;
    const member = `${nowMs}-${Math.random().toString(36).slice(2, 8)}`;
    const ttlSeconds = Math.ceil(windowMs / 1000);

    const response = await fetch(`${restUrl.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${restToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["ZREMRANGEBYSCORE", key, "-inf", String(windowStart)],
        ["ZCARD", key],
        ["ZADD", key, String(nowMs), member],
        ["EXPIRE", key, String(ttlSeconds)],
      ]),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Upstash KV rate-limit HTTP error: ${response.status}`);
    }

    const pipelineResult = (await response.json()) as Array<{
      result?: number;
      error?: string;
    }>;

    if (!Array.isArray(pipelineResult) || pipelineResult.some((r) => r?.error)) {
      throw new Error("Upstash KV pipeline returned an error.");
    }

    const countBeforeAdd = Number(pipelineResult[1]?.result ?? 0);
    if (Number.isNaN(countBeforeAdd) || countBeforeAdd >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: ttlSeconds,
        key,
      };
    }

    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - (countBeforeAdd + 1)),
      retryAfterSeconds: 0,
      key,
    };
  },
};

/**
 * Dual-key (per-IP + per-email) rate limiter for POST /api/listings.
 *
 * Hand-reviewed invariants:
 * 1. Enforces per-IP limit (default 5/hour/IP) AND per-email limit (default 5/hour/email).
 * 2. Rotating emails from the same IP still consume the IP bucket and get blocked on request #6.
 * 3. Rotating IPs with the same email still consume the email bucket and get blocked on request #6.
 * 4. Fails closed (allowed: false) if IP is missing or if the KV store throws an error.
 */
export async function checkListingSubmissionRateLimit(params: {
  ip: string;
  email?: string | null;
  maxRequestsPerHour?: number;
  windowMs?: number;
  nowMs?: number;
  store?: RateLimitStore;
}): Promise<RateLimitResult> {
  const maxRequests = params.maxRequestsPerHour ?? DEFAULT_MAX_REQUESTS_PER_HOUR;
  const windowMs = params.windowMs ?? DEFAULT_WINDOW_MS;
  const nowMs = params.nowMs ?? Date.now();
  const store = params.store ?? upstashEdgeKvStore;

  try {
    const ipKey = buildIpRateLimitKey(params.ip);
    // Fail closed if IP key cannot be constructed
    if (!ipKey) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.ceil(windowMs / 1000),
        limitedBy: "fail_closed",
      };
    }

    // 1. Check & consume per-IP limit first (stops both single-email bursts and rotating-email bursts from 1 IP)
    const ipResult = await store.consume(ipKey, maxRequests, windowMs, nowMs);
    if (!ipResult.allowed) {
      return {
        ...ipResult,
        allowed: false,
        limitedBy: ipResult.limitedBy || "ip",
        key: ipKey,
      };
    }

    // 2. Check & consume per-email limit (if email was provided in payload)
    const emailKey = buildEmailRateLimitKey(params.email || "");
    if (emailKey) {
      const emailResult = await store.consume(
        emailKey,
        maxRequests,
        windowMs,
        nowMs
      );
      if (!emailResult.allowed) {
        return {
          ...emailResult,
          allowed: false,
          limitedBy: emailResult.limitedBy || "email",
          key: emailKey,
        };
      }

      return {
        allowed: true,
        remaining: Math.min(ipResult.remaining, emailResult.remaining),
        retryAfterSeconds: 0,
        key: `${ipKey}|${emailKey}`,
      };
    }

    return ipResult;
  } catch {
    // Fail-closed behavior: if the underlying KV/rate-limit store throws, block the write
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 60,
      limitedBy: "fail_closed",
    };
  }
}

/**
 * Synchronous single-identifier helper for backward compatibility.
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS_PER_HOUR,
  windowMs: number = DEFAULT_WINDOW_MS,
  nowMs: number = Date.now()
): RateLimitResult {
  try {
    const ipKey = buildIpRateLimitKey(identifier);
    if (!ipKey) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: 60,
        limitedBy: "fail_closed",
      };
    }
    return memoryRateLimitStore.consume(
      ipKey,
      maxRequests,
      windowMs,
      nowMs
    ) as RateLimitResult;
  } catch {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 60,
      limitedBy: "fail_closed",
    };
  }
}

export function resetRateLimitStore() {
  memoryBuckets.clear();
}

