"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppProvider } from "../context/AppContext";

const CLIENT_ID = "677644907778-kvch3brqbu9f5tf2uqvg1jvakjm32s40.apps.googleusercontent.com";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <AppProvider>
        {children}
      </AppProvider>
    </GoogleOAuthProvider>
  );
}
