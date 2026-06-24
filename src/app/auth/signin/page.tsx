"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(authError === "CredentialsSignin" ? "Invalid email or password" : authError || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError(result.error === "CredentialsSignin" ? "Invalid email or password" : result.error);
      } else if (result?.url) {
        router.push(result.url);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <div className="w-full max-w-md">
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-2 mb-8">
        <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          spa
        </span>
        <span className="text-2xl font-bold text-secondary">Pharmpill Biotech</span>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2">Welcome Back</h2>
        <p className="text-on-surface-variant">
          Sign in to your account to continue your wellness journey.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-error-container rounded-lg border border-error/20 flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined text-error text-xl">error</span>
          <span className="text-sm font-medium text-on-surface">{error}</span>
        </div>
      )}

      {/* Credentials Form */}
      <form onSubmit={handleCredentialsLogin} className="flex flex-col gap-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          id="signin-email"
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          id="signin-password"
        />

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full py-3 bg-secondary hover:bg-primary text-on-secondary font-semibold shadow-md transition-all duration-300"
        >
          Sign In
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-outline-variant" />
        <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          or continue with
        </span>
        <div className="flex-1 h-px bg-outline-variant" />
      </div>

      {/* Google Sign In */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-soft-sage/30 rounded-lg bg-card-surface hover:bg-surface-container-low transition-all duration-200 font-semibold text-on-surface text-sm active:scale-[0.98]"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Sign in with Google
      </button>

      {/* Sign Up Link */}
      <p className="text-center text-sm text-on-surface-variant mt-8">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="text-secondary font-bold hover:text-primary transition-colors"
        >
          Create one now
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left — Botanical Hero Panel */}
      <div className="hidden lg:flex lg:w-1/2 auth-botanical-bg relative overflow-hidden items-center justify-center p-12">
        {/* Decorative organic shapes */}
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
            Ancient Wisdom,{" "}
            <span className="text-secondary-container">Modern Wellness</span>
          </h1>

          <p className="text-white/75 text-lg leading-relaxed mb-10 font-serif">
            Access the purest Ayurvedic formulations, handcrafted from
            bio-diverse botanicals and verified for clinical purity.
          </p>

          <div className="flex flex-col gap-4">
            {[
              { icon: "verified", text: "100% Organic Ingredients" },
              { icon: "science", text: "Lab-Tested Purity" },
              { icon: "local_shipping", text: "Pan-India Express Delivery" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-white/80">
                <span className="material-symbols-outlined text-secondary-container">
                  {item.icon}
                </span>
                <span className="text-sm font-semibold">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Sign-In Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-surface">
        <Suspense fallback={
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 border-3 border-secondary border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}
