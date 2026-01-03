"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthSuccess() {
  const router = useRouter();

  useEffect(() => {
    const completeLogin = () => {
      // 1. Notify the main window to update the avatar
      if (window.opener) {
        window.opener.postMessage("auth-success", window.location.origin);
        // Attempt to close the popup
        window.close();
      } else {
        // 2. Fallback: If opened in a new tab or opener is lost, go to Home
        router.push("/");
      }
    };

    completeLogin();
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] animate-pulse text-black">
          Authenticating...
        </p>
        <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest">
          Please wait while we redirect you.
        </p>
      </div>
    </div>
  );
}