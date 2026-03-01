"use client";
import { useUser } from "@/hooks/useUser";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";

export default function TrackRequestPage() {
  const { user, loading: userLoading } = useUser();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("new"); // 'new' | 'history'

  // Form State
  const [formData, setFormData] = useState({ type: "Interior Design", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!userLoading && !user) {
      redirect("/");
    }
  }, [user, userLoading]);

  useEffect(() => {
    fetch("/api/requests").then(res => res.json()).then(data => {
      if (Array.isArray(data)) setRequests(data);
      setLoading(false);
    });
  }, [activeTab]); // Refresh when switching tabs

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await fetch("/api/requests", {
      method: "POST",
      body: JSON.stringify(formData),
    });
    setFormData({ type: "Interior Design", description: "" });
    setIsSubmitting(false);
    setActiveTab("history");
  };

  if (userLoading) return <div className="p-12 text-center text-gray-500 uppercase text-xs tracking-widest">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto pt-12 animate-fade-in-up min-h-[60vh]">
      <h1 className="text-2xl font-light uppercase tracking-widest mb-2">Client Portal</h1>
      <p className="text-xs text-gray-400 mb-12">Welcome, {user?.user_metadata?.name || user?.email}</p>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-100 mb-8">
        {["new", "history"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-3 text-[10px] uppercase tracking-[0.2em] transition-all",
              activeTab === tab ? "border-b border-black text-[#1c1c1c]" : "text-gray-400 hover:text-[#1c1c1c]"
            )}
          >
            {tab === "new" ? "Start New Project" : "Request History"}
          </button>
        ))}
      </div>

      {activeTab === "new" ? (
        <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Project Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full border-b border-gray-200 py-2 text-sm bg-transparent focus:outline-none focus:border-black rounded-none"
            >
              <option>Interior Design</option>
              <option>Architectural Planning</option>
              <option>Renovation</option>
              <option>Consultation</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Brief Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              className="w-full border border-gray-200 p-4 text-sm focus:outline-none focus:border-black transition-colors resize-none"
              placeholder="Tell us about your space, requirements, and vision..."
            />
          </div>
          <button
            disabled={isSubmitting}
            className="bg-[#1c1c1c] text-white px-8 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-gray-800 disabled:opacity-50 transition-colors w-full md:w-auto"
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {loading ? <p className="text-xs">Loading records...</p> : requests.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No past requests found.</p>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="border border-gray-100 p-6 flex justify-between items-start hover:border-gray-200 transition-colors bg-white">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      req.status === "Completed" ? "bg-green-500" :
                        req.status === "In Progress" ? "bg-blue-500" : "bg-yellow-500"
                    )} />
                    <h3 className="text-xs font-bold uppercase tracking-widest">{req.type}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{req.description}</p>
                  {req.adminNotes && (
                    <div className="text-[10px] bg-gray-50 p-3 text-gray-500 border-l-2 border-gray-200">
                      <span className="font-bold">ADMIN NOTE:</span> {req.adminNotes}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-gray-400 mb-1">{req.date}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest border border-gray-200 px-2 py-1 rounded">
                    {req.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}