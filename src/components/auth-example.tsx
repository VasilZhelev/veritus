"use client";

/**
 * Example component showing how to use the auth context
 * This demonstrates all the available auth functionality
 */

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export function AuthExample() {
  const { user, loading, signIn, signOut, getIdToken, signInWithGoogle } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div>
        <p>Not signed in</p>
        <button onClick={() => signInWithGoogle()}>Sign in with Google</button>
      </div>
    );
  }

  const handleGetToken = async () => {
    const idToken = await getIdToken();
    setToken(idToken);
  };

  return (
    <div>
      <h2>Signed in as: {user.email}</h2>
      <p>Display Name: {user.displayName || "Not set"}</p>
      <button onClick={handleGetToken}>Get ID Token</button>
      {token && <p>Token: {token.substring(0, 20)}...</p>}
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}

