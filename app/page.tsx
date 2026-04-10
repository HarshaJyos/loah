"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import { Home } from "../components/Home";

export default function LandingPage() {
  const { accessToken, isInitialLoading, handleLoginSuccess, isSyncing } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialLoading && accessToken) {
      router.push("/dashboard");
    }
  }, [accessToken, isInitialLoading, router]);

  const onLogin = async (token: string) => {
    await handleLoginSuccess(token);
    router.push("/dashboard");
  };

  return <Home onLoginSuccess={onLogin} isLoading={isSyncing} />;
}
