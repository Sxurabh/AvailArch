"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function TrackRequestPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/api/auth/signin");
    },
  });

  return (
    <div className="max-w-2xl mx-auto pt-10 animate-fade-in-up">
      <h1 className="text-xl font-light mb-8 uppercase tracking-widest">Request Status</h1>
      <div className="border border-gray-100 p-8 text-center bg-gray-50/50">
        <p className="text-xs text-gray-500 tracking-wide mb-4">
          WELCOME BACK, {session?.user?.name}
        </p>
        <p className="text-sm font-medium">No active project requests found.</p>
        <p className="text-xs text-gray-400 mt-2">Please contact us to start a new project.</p>
      </div>
    </div>
  );
}