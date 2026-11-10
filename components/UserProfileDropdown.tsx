"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, PlusCircle, LogOut } from "lucide-react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./Button";

export interface UserProfileDropdownProps {
  onSignInClick?: () => void;
}

interface ProfileState {
  email: string;
  fullName: string;
  avatarUrl: string | null;
  custIdExt: number | null;
}

function getInitials(nameOrEmail: string): string {
  const cleaned = (nameOrEmail || "").trim();
  if (!cleaned) return "U";
  const parts = cleaned.split(/[\s._@-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase();
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
  onSignInClick,
}) => {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<ProfileState | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    async function loadUserAndProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUserProfile(null);
        return;
      }

      const metaName =
        (user.user_metadata?.full_name as string) ||
        (user.user_metadata?.name as string) ||
        user.email?.split("@")[0] ||
        "Maker";
      const metaAvatar =
        (user.user_metadata?.avatar_url as string) ||
        (user.user_metadata?.picture as string) ||
        null;

      // Optimistically set public display fields from auth user metadata first
      setUserProfile({
        email: user.email || "",
        fullName: metaName,
        avatarUrl: metaAvatar,
        custIdExt: null,
      });

      // Fetch profile row from public.profiles (for cust_id_ext, full_name, avatar_url)
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("cust_id_ext, full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (profileRow) {
        setUserProfile({
          email: user.email || "",
          fullName: profileRow.full_name || metaName,
          avatarUrl: profileRow.avatar_url || metaAvatar,
          custIdExt: profileRow.cust_id_ext ?? null,
        });
      }
    }

    loadUserAndProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (!session?.user) {
          setUserProfile(null);
          setIsOpen(false);
        } else {
          loadUserAndProfile();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsOpen(false);
    setUserProfile(null);
    router.refresh();
  };

  // Not signed in -> Show Sign In button
  if (!userProfile) {
    if (onSignInClick) {
      return (
        <Button
          variant="secondary"
          size="sm"
          onClick={onSignInClick}
          className="text-xs font-semibold"
        >
          Sign In
        </Button>
      );
    }

    return (
      <Link href="/login">
        <Button
          variant="secondary"
          size="sm"
          className="text-xs font-semibold"
        >
          Sign In
        </Button>
      </Link>
    );
  }

  const initials = getInitials(userProfile.fullName || userProfile.email);

  // Signed in -> Show circular Avatar Logo ONLY (opens dropdown on click)
  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open profile menu"
        aria-expanded={isOpen}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5B5BF0] text-white font-bold text-xs border-2 border-white ring-1 ring-[#E8E8E3] hover:ring-[#5B5BF0] transition-all cursor-pointer shadow-xs overflow-hidden"
      >
        {userProfile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={userProfile.avatarUrl}
            alt={userProfile.fullName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-[14px] border border-[#E8E8E3] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.12)] p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* User Info Header */}
          <div className="px-3 py-2.5 border-b border-[#E8E8E3] space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-xs text-[#0F0F10] truncate">
                {userProfile.fullName}
              </span>
              {userProfile.custIdExt && (
                <span className="rounded-full bg-[#EEF0FE] px-2 py-0.5 font-mono text-[10px] font-bold text-[#5B5BF0] shrink-0">
                  #{userProfile.custIdExt}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#66666B] font-mono truncate">
              {userProfile.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1 space-y-0.5">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-xs font-semibold text-[#0F0F10] hover:bg-[#FAFAF7] transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-[#5B5BF0]" />
              <span>Dashboard &amp; Profile</span>
            </Link>

            <Link
              href="/submit"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-xs font-semibold text-[#0F0F10] hover:bg-[#FAFAF7] transition-colors"
            >
              <PlusCircle className="h-4 w-4 text-[#5B5BF0]" />
              <span>Submit a Product</span>
            </Link>
          </div>

          {/* Sign Out */}
          <div className="pt-1 border-t border-[#E8E8E3]">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-xs font-bold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
