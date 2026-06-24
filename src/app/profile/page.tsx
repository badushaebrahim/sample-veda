"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-secondary border-t-transparent rounded-full animate-spin" />
          <span className="text-on-surface-variant font-semibold text-sm">Loading your profile...</span>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin?callbackUrl=/profile");
    return null;
  }

  const user = session?.user;
  const userRole = (user as any)?.role || "customer";
  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-surface">
      <nav className="sticky top-0 z-50 bg-surface-container-low/80 backdrop-blur-md shadow-sm">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center px-4 md:px-8 py-4">
          <Link href="/" className="font-bold text-2xl text-secondary">Pharmpill Biotech</Link>
          <Link href="/" className="text-on-surface-variant hover:text-secondary transition-colors text-sm font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Store
          </Link>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-12">
        {/* Profile Header */}
        <div className="bg-card-surface rounded-2xl border border-soft-sage/20 overflow-hidden shadow-sm mb-8">
          <div className="h-32 auth-botanical-bg relative"><div className="absolute inset-0 bg-black/10" /></div>
          <div className="px-8 pb-8 relative">
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-on-secondary text-3xl font-bold border-4 border-card-surface shadow-lg -mt-12 relative z-10">
              {userInitial}
            </div>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-primary">{userName}</h1>
                <p className="text-on-surface-variant mt-1">{userEmail}</p>
                <Badge variant="primary" className="mt-3 bg-secondary-container text-on-secondary-container border-none px-3 py-1 uppercase tracking-wider text-xs font-bold">
                  {userRole}
                </Badge>
              </div>
              <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-2 border-error/30 text-error hover:bg-error-container/30 self-start">
                <span className="material-symbols-outlined text-lg">logout</span>
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Account Details */}
            <div className="bg-card-surface rounded-2xl border border-soft-sage/20 p-8 shadow-sm">
              <h2 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">person</span>
                Account Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: "Full Name", value: userName, icon: "badge" },
                  { label: "Email", value: userEmail, icon: "mail" },
                  { label: "Account Type", value: userRole.charAt(0).toUpperCase() + userRole.slice(1), icon: "shield" },
                  { label: "Member Since", value: new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long" }), icon: "calendar_month" },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary-container/30 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-secondary text-xl">{item.icon}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">{item.label}</span>
                      <span className="text-sm font-semibold text-on-surface mt-0.5 block">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Orders */}
            <div className="bg-card-surface rounded-2xl border border-soft-sage/20 p-8 shadow-sm">
              <h2 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">receipt_long</span>
                Order History
              </h2>
              <div className="text-center py-12 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl text-soft-sage mb-4 block">inventory_2</span>
                <p className="font-semibold mb-1">No orders yet</p>
                <p className="text-sm">Explore our <Link href="/" className="text-secondary font-bold hover:underline">product catalog</Link> to find authentic remedies.</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card-surface rounded-2xl border border-soft-sage/20 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider">Quick Actions</h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Browse Remedies", icon: "spa", href: "/" },
                  { label: "Track Orders", icon: "local_shipping", href: "/" },
                ].map((action) => (
                  <Link key={action.label} href={action.href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-soft-sage/10 transition-all text-on-surface-variant hover:text-secondary group">
                    <span className="material-symbols-outlined text-xl text-soft-sage group-hover:text-secondary transition-colors">{action.icon}</span>
                    <span className="text-sm font-semibold">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="bg-secondary rounded-2xl p-6 text-on-secondary">
              <span className="material-symbols-outlined text-3xl mb-3 block">support_agent</span>
              <h3 className="font-bold text-lg mb-2">Need Help?</h3>
              <p className="text-sm text-on-secondary/80 mb-4 leading-relaxed">Our Ayurvedic wellness consultants are available to guide your health journey.</p>
              <button className="w-full py-2.5 bg-white/15 hover:bg-white/25 rounded-lg text-sm font-semibold transition-all">Contact Support</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
