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

  if (userLoading) return (
    <div className="p-12 text-center text-xs uppercase tracking-widest" style={{ color: 'rgb(var(--fg-muted))' }}>
      Loading...
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pt-12 animate-fade-in-up min-h-[60vh]">
      <h1 className="text-2xl font-light uppercase tracking-widest mb-2" style={{ color: 'rgb(var(--fg))' }}>Client Portal</h1>
      <p className="text-xs mb-12" style={{ color: 'rgb(var(--fg-muted))' }}>Welcome, {user?.user_metadata?.name || user?.email}</p>

      {/* Tabs */}
      <div className="flex gap-8 mb-8 border-b" style={{ borderColor: 'rgb(var(--border))' }}>
        {["new", "history"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="pb-3 text-[10px] uppercase tracking-[0.2em] transition-all"
            style={{
              color: activeTab === tab ? 'rgb(var(--fg))' : 'rgb(var(--fg-muted))',
              fontWeight: activeTab === tab ? '700' : '400',
              borderBottom: activeTab === tab ? '1px solid rgb(var(--fg))' : 'none',
            }}
          >
            {tab === "new" ? "Start New Project" : "Request History"}
          </button>
        ))}
      </div>

      {activeTab === "new" ? (
        <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: 'rgb(var(--fg-muted))' }}>Project Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full py-2 text-sm bg-transparent focus:outline-none rounded-none border-b"
              style={{ borderColor: 'rgb(var(--border))', color: 'rgb(var(--fg))' }}
            >
              <option style={{ background: 'rgb(var(--bg))', color: 'rgb(var(--fg))' }}>Interior Design</option>
              <option style={{ background: 'rgb(var(--bg))', color: 'rgb(var(--fg))' }}>Architectural Planning</option>
              <option style={{ background: 'rgb(var(--bg))', color: 'rgb(var(--fg))' }}>Renovation</option>
              <option style={{ background: 'rgb(var(--bg))', color: 'rgb(var(--fg))' }}>Consultation</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: 'rgb(var(--fg-muted))' }}>Brief Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              className="w-full p-4 text-sm focus:outline-none transition-colors resize-none border"
              style={{
                borderColor: 'rgb(var(--border))',
                color: 'rgb(var(--fg))',
                background: 'transparent',
              }}
              placeholder="Tell us about your space, requirements, and vision..."
            />
          </div>
          <button
            disabled={isSubmitting}
            className="px-8 py-3 text-[10px] uppercase tracking-[0.2em] disabled:opacity-50 transition-colors w-full md:w-auto"
            style={{ background: 'rgb(var(--fg))', color: 'rgb(var(--bg))' }}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <p className="text-xs" style={{ color: 'rgb(var(--fg-muted))' }}>Loading records...</p>
          ) : requests.length === 0 ? (
            <p className="text-xs italic" style={{ color: 'rgb(var(--fg-muted))' }}>No past requests found.</p>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="p-6 flex justify-between items-start transition-colors border"
                style={{ borderColor: 'rgb(var(--border))', background: 'rgb(var(--bg-surface))' }}
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      req.status === "Completed" ? "bg-green-500" :
                        req.status === "In Progress" ? "bg-blue-500" : "bg-yellow-500"
                    )} />
                    <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgb(var(--fg))' }}>{req.type}</h3>
                  </div>
                  <p className="text-sm mb-3" style={{ color: 'rgb(var(--fg-muted))' }}>{req.description}</p>
                  {req.adminNotes && (
                    <div className="text-[10px] p-3 border-l-2" style={{ background: 'rgba(var(--border), 0.3)', borderColor: 'rgb(var(--border))', color: 'rgb(var(--fg-muted))' }}>
                      <span className="font-bold">ADMIN NOTE:</span> {req.adminNotes}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="block text-[10px] mb-1" style={{ color: 'rgb(var(--fg-muted))' }}>{req.date}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded border" style={{ borderColor: 'rgb(var(--border))', color: 'rgb(var(--fg))' }}>
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
