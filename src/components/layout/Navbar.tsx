"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export const Navbar: React.FC<{ cartCount?: number; onCartClick?: () => void }> = ({
  cartCount = 0,
  onCartClick,
}) => {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isAuthenticated = status === "authenticated";
  const userName = session?.user?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  const navLinks = [
    { label: "Remedies", href: "/", active: true },
    { label: "Herbs", href: "/" },
    { label: "Consultations", href: "/" },
    { label: "Wellness", href: "/" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-surface-container-low/80 backdrop-blur-md shadow-sm">
      <div className="max-w-[1200px] mx-auto flex justify-between items-center px-4 md:px-8 py-4">
        {/* Logo + Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-2xl text-secondary">
            Pharmpill Biotech
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-semibold transition-colors duration-200 ${
                  link.active
                    ? "text-secondary border-b-2 border-secondary pb-1"
                    : "text-on-surface-variant hover:text-secondary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Search (desktop only) */}
          <div className="hidden lg:flex items-center bg-surface-container px-4 py-2 rounded-full border border-soft-sage/30">
            <span className="material-symbols-outlined text-on-surface-variant mr-2 text-xl">search</span>
            <input className="bg-transparent border-none focus:ring-0 text-sm w-44 outline-none placeholder:text-on-surface-variant/60" placeholder="Search remedies..." type="text" />
          </div>

          {/* Cart */}
          <button
            onClick={onCartClick}
            className="relative p-2 text-on-surface-variant hover:text-secondary rounded-full hover:bg-secondary-container/20 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-warm-ochre text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          {/* User */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-on-secondary font-bold text-sm hover:ring-2 hover:ring-secondary/30 transition-all"
              >
                {userInitial}
              </button>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-card-surface rounded-xl border border-soft-sage/20 shadow-xl z-50 animate-scale-up overflow-hidden">
                    <div className="px-4 py-3 border-b border-outline-variant/20">
                      <p className="text-sm font-bold text-on-surface">{userName}</p>
                      <p className="text-xs text-on-surface-variant">{session?.user?.email}</p>
                    </div>
                    <div className="p-1">
                      <Link href="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-soft-sage/10 hover:text-secondary rounded-lg transition-all">
                        <span className="material-symbols-outlined text-lg">person</span>
                        My Profile
                      </Link>
                      
                      {session?.user && (session.user as any).role === "admin" && (
                        <Link href="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-soft-sage/10 hover:text-secondary rounded-lg transition-all">
                          <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                          Admin Dashboard
                        </Link>
                      )}

                      {session?.user && (session.user as any).role === "factory" && (
                        <Link href="/factory" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-soft-sage/10 hover:text-secondary rounded-lg transition-all">
                          <span className="material-symbols-outlined text-lg">precision_manufacturing</span>
                          Factory Console
                        </Link>
                      )}

                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-error hover:bg-error-container/20 rounded-lg transition-all text-left"
                      >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="p-2 text-on-surface-variant hover:text-secondary rounded-full hover:bg-secondary-container/20 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined">account_circle</span>
            </Link>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-on-surface-variant hover:text-secondary rounded-lg">
            <span className="material-symbols-outlined text-2xl">{isOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden animate-fade-in bg-surface border-t border-outline-variant/20 pb-4">
          <div className="px-4 pt-2 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} onClick={() => setIsOpen(false)} className="flex items-center px-3 py-3 text-base font-semibold text-on-surface hover:bg-soft-sage/10 hover:text-secondary rounded-lg transition-all">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="px-4 pt-3 border-t border-outline-variant/20 mt-2">
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-3 text-sm font-semibold text-on-surface hover:bg-soft-sage/10 rounded-lg">
                  <span className="material-symbols-outlined text-secondary">person</span>
                  My Profile
                </Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-3 px-3 py-3 text-sm font-semibold text-error hover:bg-error-container/20 rounded-lg">
                  <span className="material-symbols-outlined">logout</span>
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/auth/signin" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-on-secondary rounded-lg font-semibold">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
