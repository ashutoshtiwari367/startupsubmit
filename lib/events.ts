import "server-only";
import { db } from "@/lib/db";
import type { PricingModel, ListingStatus, Json, BigIntId } from "@/types/db";

export type ListingEventName =
  | "listing_submitted"
  | "listing_approved"
  | "listing_rejected";

export interface ListingEventPayload {
  listing_id: BigIntId;
  reference_code?: string;
  name: string;
  slug: string;
  submitted_by_email: string;
  category_id: BigIntId;
  pricing_model: PricingModel;
  website_url: string;
  status: ListingStatus;
  approved_at?: string | null;
  timestamp: string;
}

export type ListingSubmittedEventPayload = Omit<
  ListingEventPayload,
  "timestamp"
> & {
  submitted_at: string;
};

type EventHandler = (
  payload: ListingEventPayload,
  eventName: ListingEventName
) => void | Promise<void>;

const listeners: Record<ListingEventName, EventHandler[]> = {
  listing_submitted: [],
  listing_approved: [],
  listing_rejected: [],
};

export function onListingEvent(
  eventName: ListingEventName,
  handler: EventHandler
) {
  listeners[eventName].push(handler);
}

export function onListingSubmitted(
  handler: (payload: ListingEventPayload) => void | Promise<void>
) {
  onListingEvent("listing_submitted", handler);
}

/**
 * Core helper to emit and persist any listing lifecycle event:
 * - listing_submitted
 * - listing_approved
 * - listing_rejected
 */
export async function emitListingLifecycleEvent<T extends ListingEventName>(
  eventName: T,
  payload: ListingEventPayload
): Promise<{ emitted: true; event_name: T; timestamp: string }> {
  const timestamp = payload.timestamp || new Date().toISOString();

  // 1. Structured server event log
  console.info(
    JSON.stringify({
      event: eventName,
      timestamp,
      data: payload,
    })
  );

  // 2. Persist event record in Supabase 'events' table
  try {
    const numericListingId =
      typeof payload.listing_id === "number"
        ? payload.listing_id
        : Number(payload.listing_id);

    await db.from("events").insert({
      event_name: eventName,
      listing_id: Number.isFinite(numericListingId) ? numericListingId : null,
      payload: payload as unknown as Json,
    });
  } catch (err) {
    console.warn(`[${eventName}] Could not persist to events table:`, err);
  }

  // 3. Notify any registered in-process subscribers
  for (const handler of listeners[eventName]) {
    try {
      await handler(payload, eventName);
    } catch (err) {
      console.error(`[${eventName}] Subscriber error:`, err);
    }
  }

  return {
    emitted: true,
    event_name: eventName,
    timestamp,
  };
}

export async function emitListingSubmitted(
  payload: ListingSubmittedEventPayload
) {
  return emitListingLifecycleEvent("listing_submitted", {
    ...payload,
    timestamp: payload.submitted_at || new Date().toISOString(),
  });
}

export async function emitListingApproved(
  payload: Omit<ListingEventPayload, "timestamp" | "status"> & {
    approved_at: string;
  }
) {
  return emitListingLifecycleEvent("listing_approved", {
    ...payload,
    status: "approved",
    timestamp: payload.approved_at || new Date().toISOString(),
  });
}

export async function emitListingRejected(
  payload: Omit<ListingEventPayload, "timestamp" | "status"> & {
    rejected_at?: string;
  }
) {
  return emitListingLifecycleEvent("listing_rejected", {
    ...payload,
    status: "rejected",
    timestamp: payload.rejected_at || new Date().toISOString(),
  });
}
