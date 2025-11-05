'use client';
import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";


export default function DebugAuthPage() {
    useEffect(() => {
        const signInTestUser = async () => {
          try {
            // TEMPORARY TEST LOGIN
            await signInWithEmailAndPassword(auth, "vasilzhelev28@itpg-varna.bg", "pgkmks69420");
            console.log("Test user signed in");
          } catch (error) {
            console.error("Error signing in test user:", error);
           }
        };
      
        signInTestUser();
      
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (user) {
            console.log("✅ User is signed in:", user.email);
      
            const token = await user.getIdToken();
            console.log("🔑 User ID token:", token);
      
            const res = await fetch("/api/auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token }),
            });
      
            const data = await res.json();
            console.log("🛠️ API response:", data);
          } else {
            console.log("⚠️ No user is signed in");
          }
        });
      
        return () => unsubscribe();
      }, []);
      

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Firebase Auth Debug</h1>
      <p>Open your browser console to see debug logs.</p>
    </div>
  );
}
