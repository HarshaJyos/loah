"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppProvider } from "../context/AppContext";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <AppProvider>
        {children}
      </AppProvider>
    </GoogleOAuthProvider>
  );
}
