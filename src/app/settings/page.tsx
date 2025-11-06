"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { FirebaseError } from "firebase/app";
import { Eye, EyeOff, Mail, Lock, User, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

function PasswordInput({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  showToggle = true,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  showToggle?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const id = `password-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className="pr-10"
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, loading, updateUserProfile, changeEmail, changePassword, deleteAccount, sendVerificationEmail } = useAuth();
  const router = useRouter();

  // Profile state
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Email state
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Delete account state
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getErrorMessage = (error: FirebaseError): string => {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "This email is already in use.";
      case "auth/invalid-email":
        return "Invalid email address.";
      case "auth/weak-password":
        return "Password is too weak. Please use a stronger password.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/requires-recent-login":
        return "Please sign out and sign in again before making this change.";
      default:
        return error.message || "An error occurred. Please try again.";
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);
    setProfileLoading(true);

    try {
      await updateUserProfile({ displayName: displayName || undefined });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      if (err instanceof FirebaseError) {
        setProfileError(getErrorMessage(err));
      } else {
        setProfileError("An error occurred. Please try again.");
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(false);
    setEmailLoading(true);

    try {
      await changeEmail(newEmail);
      setEmailSuccess(true);
      setNewEmail("");
      setTimeout(() => setEmailSuccess(false), 5000);
    } catch (err) {
      if (err instanceof FirebaseError) {
        setEmailError(getErrorMessage(err));
      } else {
        setEmailError("An error occurred. Please try again.");
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      if (err instanceof FirebaseError) {
        setPasswordError(getErrorMessage(err));
      } else {
        setPasswordError("An error occurred. Please try again.");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    setDeleteLoading(true);

    try {
      await deleteAccount(deletePassword);
      router.push("/");
    } catch (err) {
      if (err instanceof FirebaseError) {
        setDeleteError(getErrorMessage(err));
      } else {
        setDeleteError("An error occurred. Please try again.");
      }
      setDeleteLoading(false);
    }
  };

  const handleSendVerification = async () => {
    try {
      await sendVerificationEmail();
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 5000);
    } catch (err) {
      if (err instanceof FirebaseError) {
        setEmailError(getErrorMessage(err));
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Profile</h2>
              <p className="text-sm text-muted-foreground">Update your display name</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                disabled={profileLoading}
              />
            </div>

            {profileError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                Profile updated successfully!
              </div>
            )}

            <Button type="submit" disabled={profileLoading}>
              {profileLoading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </Card>

        {/* Email Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Email</h2>
              <p className="text-sm text-muted-foreground">Change your email address</p>
            </div>
          </div>

          <div className="mb-4 p-4 rounded-lg bg-muted">
            <p className="text-sm font-medium">Current Email</p>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            {!user.emailVerified && (
              <div className="mt-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-yellow-600 dark:text-yellow-400">
                  Email not verified
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSendVerification}
                  className="ml-auto"
                >
                  Send Verification Email
                </Button>
              </div>
            )}
          </div>

          <form onSubmit={handleChangeEmail} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="newEmail">New Email</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new@example.com"
                disabled={emailLoading}
                required
              />
            </div>

            {emailError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {emailError}
              </div>
            )}

            {emailSuccess && (
              <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                Verification email sent! Please check your new email address.
              </div>
            )}

            <Button type="submit" disabled={emailLoading || !newEmail}>
              {emailLoading ? "Updating..." : "Change Email"}
            </Button>
          </form>
        </Card>

        {/* Password Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Password</h2>
              <p className="text-sm text-muted-foreground">Change your password</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <PasswordInput
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={passwordLoading}
              placeholder="Enter current password"
            />

            <PasswordInput
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={passwordLoading}
              placeholder="Enter new password"
            />

            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={passwordLoading}
              placeholder="Confirm new password"
            />

            {passwordError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                Password updated successfully!
              </div>
            )}

            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading ? "Updating..." : "Change Password"}
            </Button>
          </form>
        </Card>

        {/* Delete Account */}
        <Card className="p-6 border-destructive/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-destructive">Delete Account</h2>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Account
              </Button>
            </div>
          ) : (
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/50">
                <p className="text-sm font-medium text-destructive mb-2">
                  This action cannot be undone!
                </p>
                <p className="text-sm text-muted-foreground">
                  Enter your password to confirm account deletion.
                </p>
              </div>

              <PasswordInput
                label="Confirm Password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                disabled={deleteLoading}
                placeholder="Enter your password"
              />

              {deleteError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {deleteError}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword("");
                    setDeleteError(null);
                  }}
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={deleteLoading || !deletePassword}
                >
                  {deleteLoading ? "Deleting..." : "Delete Account"}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

