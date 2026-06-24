"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      // Auto sign-in after successful registration
      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Registration succeeded but auto-login failed — redirect to sign in
        router.push("/auth/signin");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Botanical Hero Panel */}
      <div className="hidden lg:flex lg:w-1/2 auth-botanical-bg relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[120%] bg-white/5 organic-shape blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[100%] bg-white/5 organic-shape blur-3xl" />

        <div className="relative z-10 max-w-md text-white">
          <div className="flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              spa
            </span>
            <span className="text-3xl font-bold tracking-tight">
              Pharmpill Biotech
            </span>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-6">
            Begin Your Path{" "}
            <span className="text-secondary-container">to Balance</span>
          </h1>

          <p className="text-white/75 text-lg leading-relaxed mb-10 font-serif">
            Join our community of over 50,000 wellness seekers. Get seasonal
            Ayurvedic tips and exclusive access to new herbal arrivals.
          </p>

          <div className="grid grid-cols-3 gap-6 mt-10">
            {[
              { value: "50K+", label: "Happy Users" },
              { value: "200+", label: "Formulations" },
              { value: "99.8%", label: "Purity Score" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-secondary-container">
                  {stat.value}
                </div>
                <div className="text-xs text-white/60 mt-1 font-semibold uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-surface">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              spa
            </span>
            <span className="text-2xl font-bold text-secondary">Pharmpill Biotech</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-primary mb-2">
              Create Account
            </h2>
            <p className="text-on-surface-variant">
              Start your wellness journey with a free account.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-error-container rounded-lg border border-error/20 flex items-center gap-3 animate-fade-in">
              <span className="material-symbols-outlined text-error text-xl">error</span>
              <span className="text-sm font-medium text-on-surface">{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="flex flex-col gap-5">
            <Input
              label="Full Name"
              name="name"
              placeholder="Atreya Dev"
              value={form.name}
              onChange={handleChange}
              required
              id="signup-name"
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              id="signup-email"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                id="signup-password"
              />
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                id="signup-confirm-password"
              />
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full py-3 bg-secondary hover:bg-primary text-on-secondary font-semibold shadow-md transition-all duration-300"
            >
              Create Account
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              or
            </span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>

          {/* Google Sign Up */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-soft-sage/30 rounded-lg bg-card-surface hover:bg-surface-container-low transition-all duration-200 font-semibold text-on-surface text-sm active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign up with Google
          </button>

          <p className="text-center text-sm text-on-surface-variant mt-8">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-secondary font-bold hover:text-primary transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
