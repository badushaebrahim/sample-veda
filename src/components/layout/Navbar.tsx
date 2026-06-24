"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, ShoppingBag, Shield, Activity, User, LogOut } from "lucide-react";

interface NavbarProps {
  userRole?: "customer" | "factory" | "admin";
  userName?: string;
  cartCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  userRole = "customer",
  userName = "Atreya Dev",
  cartCount = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getLinksForRole = () => {
    switch (userRole) {
      case "admin":
        return [
          { label: "Marketplace", href: "/", icon: ShoppingBag },
          { label: "Admin Console", href: "/admin", icon: Shield },
          { label: "Inventory", href: "/factory", icon: Activity },
        ];
      case "factory":
        return [
          { label: "Inventory Manager", href: "/factory", icon: Activity },
          { label: "View Storefront", href: "/", icon: ShoppingBag },
        ];
      default:
        return [
          { label: "Shop Products", href: "/", icon: ShoppingBag },
          { label: "My Orders", href: "/orders", icon: User },
        ];
    }
  };

  const navLinks = getLinksForRole();

  return (
    <nav className="sticky top-0 z-50 bg-cream-50/90 backdrop-blur-md border-b border-cream-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-serif font-bold text-primary tracking-wide">
                Stitch <span className="text-secondary font-sans font-semibold">Veda</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] tracking-wider font-semibold uppercase bg-primary/10 text-primary-dark rounded">
                Ayurveda
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex ml-10 space-x-6">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-cream-900/85 hover:text-primary transition-colors"
                  >
                    <Icon className="w-4 h-4 text-primary/75" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="hidden md:flex items-center gap-4">
            {userRole === "customer" && (
              <button className="relative p-2 text-primary hover:bg-primary/5 rounded-full transition-colors">
                <ShoppingBag className="w-5.5 h-5.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-cream-50 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            <div className="h-6 w-[1px] bg-cream-200"></div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-semibold text-primary-dark leading-tight">
                  {userName}
                </div>
                <div className="text-[10px] font-semibold tracking-wide text-secondary uppercase leading-none">
                  {userRole}
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                {userName.charAt(0)}
              </div>
              <button className="p-2 text-cream-900/55 hover:text-red-700 rounded-full hover:bg-red-50 transition-all">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-3">
            {userRole === "customer" && (
              <button className="relative p-2 text-primary">
                <ShoppingBag className="w-5.5 h-5.5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-secondary text-cream-50 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-primary hover:bg-primary/5 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden animate-fade-in bg-cream-50 border-b border-cream-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-base font-semibold text-cream-900 hover:bg-primary/5 hover:text-primary rounded-lg transition-all"
                >
                  <Icon className="w-5 h-5 text-primary" />
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-cream-200/60 px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                {userName.charAt(0)}
              </div>
              <div>
                <div className="text-base font-bold text-primary-dark">{userName}</div>
                <div className="text-xs font-semibold text-secondary uppercase">{userRole}</div>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <button className="flex w-full items-center justify-center gap-2 px-4 py-2 text-sm font-semibold border border-red-700/30 text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
