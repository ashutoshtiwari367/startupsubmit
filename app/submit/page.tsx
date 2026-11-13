import React from "react";
import { createClient } from "@/lib/supabase/server";
import { SubmitForm } from "@/components/SubmitForm";

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  let initialEmail = "";
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.email) {
      initialEmail = user.email;
    }
  } catch {
    // Guest visitor
  }

  return <SubmitForm initialEmail={initialEmail} />;
}
