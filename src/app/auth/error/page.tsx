"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "AccessDenied":
        return "You do not have permission to sign in.";
      case "Verification":
        return "The verification token has expired or has already been used.";
      case "CredentialsSignin":
        return "The email or password you entered is incorrect.";
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
        return "There was a problem connecting to Google. Please try again.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-error-container flex items-center justify-center">
          <span className="material-symbols-outlined text-error text-4xl">
            error
          </span>
        </div>

        <h1 className="text-2xl font-bold text-primary mb-3">
          Authentication Error
        </h1>

        <p className="text-on-surface-variant mb-8 leading-relaxed">
          {getErrorMessage(error)}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/signin"
            className="px-6 py-3 bg-secondary text-on-secondary rounded-lg font-semibold hover:bg-primary transition-all duration-300 text-sm"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border border-soft-sage/30 text-secondary rounded-lg font-semibold hover:bg-soft-sage/10 transition-all duration-300 text-sm"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-12 h-12 border-3 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
