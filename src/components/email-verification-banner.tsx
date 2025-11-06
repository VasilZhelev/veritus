"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { X, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmailVerificationBanner() {
  const { user, sendVerificationEmail, reloadUser } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [checking, setChecking] = useState(false);

  // Check if email is verified
  const isVerified = user?.emailVerified ?? false;
  const shouldShow = !dismissed && user && !isVerified;

  // Auto-check verification status every 30 seconds
  useEffect(() => {
    if (!shouldShow) return;

    const interval = setInterval(async () => {
      setChecking(true);
      try {
        await reloadUser();
      } catch (error) {
        console.error("Error reloading user:", error);
      } finally {
        setChecking(false);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [shouldShow, reloadUser]);

  const handleSendVerification = async () => {
    setSending(true);
    try {
      await sendVerificationEmail();
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      console.error("Error sending verification email:", error);
    } finally {
      setSending(false);
    }
  };

  if (!shouldShow) return null;

  return (
    <div className="border-b bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              {sent ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              {sent ? (
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Verification email sent!
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
                    Please check your inbox at {user?.email}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    Please verify your email address
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">
                    We sent a verification email to {user?.email}. Click the link in the email to verify your account.
                    {checking && " (Checking...)"}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!sent && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendVerification}
                disabled={sending}
                className="border-yellow-300 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100 hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
              >
                <Mail className="h-4 w-4 mr-2" />
                {sending ? "Sending..." : "Resend"}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDismissed(true)}
              className="h-8 w-8 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

