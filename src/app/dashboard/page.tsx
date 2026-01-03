"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/api/auth/signin");
    },
  });

  // Basic role check (Client-side)
  // Ideally, use middleware for stricter protection
  if (session?.user && (session.user as any).role !== "admin") {
     return (
       <div className="pt-20 text-center text-xs tracking-widest uppercase text-red-500">
         Access Restricted: Admins Only
       </div>
     )
  }

  return (
    <div className="max-w-4xl mx-auto pt-10 animate-fade-in-up">
      <div className="flex justify-between items-end mb-12">
        <h1 className="text-xl font-light uppercase tracking-widest">Admin Dashboard</h1>
        <span className="text-[10px] text-gray-400 tracking-widest">OVERVIEW</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Stat Cards */}
        {["Total Projects", "Pending Requests", "Active Clients"].map((title) => (
          <div key={title} className="border border-gray-100 p-6 hover:border-gray-300 transition-colors">
            <h3 className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">{title}</h3>
            <p className="text-3xl font-light">0</p>
          </div>
        ))}
      </div>
    </div>
  );
}