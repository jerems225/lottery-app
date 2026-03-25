"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * Referral Bridge
 * When a user visits /ref/[id], we save the referrer ID in a cookie (manual via document.cookie)
 * then redirect them to the registration page.
 */
export default function ReferralBridge() {
  const params = useParams();
  const router = useRouter();
  const refId = params.id as string;

  useEffect(() => {
    if (refId) {
      // Set a cookie that expires in 30 days
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      document.cookie = `bitlot_ref=${refId}; path=/; expires=${expires.toUTCString()}`;
    }
    router.push("/login?tab=register");
  }, [refId, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-light">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-gold border-t-transparent rounded-full animate-spin" />
        <span className="font-black text-xs uppercase tracking-widest text-text-muted">Registering Referral...</span>
      </div>
    </div>
  );
}
