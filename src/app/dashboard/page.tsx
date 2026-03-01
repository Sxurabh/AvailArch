// src/app/dashboard/page.tsx
"use client";
import { useUser } from "@/hooks/useUser";
import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import ProjectManager from "@/components/admin/ProjectManager";
import ResponseManager from "@/app/components/admin/ResponseManager";

// --- Icons ---
const Icons = {
  Grid: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  List: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>,
  ChevronLeft: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
  Refresh: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  Inbox: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>,
  Close: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
};

export default function AdminDashboard() {
  const { user, loading: userLoading } = useUser();

  useEffect(() => {
    if (!userLoading && !user) {
      redirect("/");
    }
  }, [user, userLoading]);

  // --- Request Management State ---
  const [requests, setRequests] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<"requests" | "projects" | "responses">("requests");
  const [loading, setLoading] = useState(true);

  // --- Modal State ---
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch Requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/requests");
        const data = await res.json();
        if (Array.isArray(data)) setRequests(data);
        setLoading(false);
      } catch (e) {
        console.error("Fetch error", e);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update Request Status
  const updateStatus = async (id: string, newStatus: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
    await fetch("/api/requests", {
      method: "PATCH",
      body: JSON.stringify({ id, status: newStatus }),
    });
  };

  if (userLoading) return <div className="p-12 text-center text-gray-500 uppercase text-xs tracking-widest">Loading Dashboard...</div>;
  if (user && user.role !== "admin") return <div className="p-12 text-center text-red-500 uppercase text-xs tracking-widest">Access Denied</div>;

  // Pagination Logic
  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const currentData = requests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const StatCard = ({ title, value, sub }: { title: string, value: string | number, sub?: string }) => (
    <div className="bg-white/5 border border-white/10 p-6 flex flex-col justify-between h-32 hover:border-[#8a9a5b]/50 transition-colors duration-300">
      <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-semibold">{title}</h3>
      <div>
        <p className="text-3xl font-light tracking-tight text-white">{value}</p>
        {sub && <p className="text-[10px] text-[#8a9a5b] mt-1 uppercase tracking-wider">{sub}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] pt-24 pb-24 px-6 md:px-12 font-sans selection:bg-[#8a9a5b]" style={{ background: 'rgb(var(--bg-surface))', color: 'rgb(var(--fg))' }}>
      <div className="max-w-[1600px] mx-auto relative">

        {/* --- Request Detail Modal --- */}
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1c1c1c]/80 backdrop-blur-sm" onClick={() => setSelectedRequest(null)}>
            <div
              className="bg-[#222222] w-full max-w-2xl p-8 shadow-2xl border border-white/10 relative animate-in fade-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedRequest(null)}
                className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
              >
                <Icons.Close />
              </button>

              <div className="mb-6 border-b border-white/10 pb-4">
                <h3 className="text-xl uppercase tracking-[0.15em] font-light text-white mb-1">Request Details</h3>
                <p className="text-[10px] text-[#8a9a5b] uppercase tracking-widest">
                  ID: #{selectedRequest.id?.slice(-4)} • {selectedRequest.date}
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-white/40 block mb-2 font-semibold">Client</span>
                    <p className="text-sm font-medium text-white break-words">{selectedRequest.userEmail}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-white/40 block mb-2 font-semibold">Project Type</span>
                    <p className="text-sm font-medium text-white">{selectedRequest.type}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] uppercase tracking-widest text-white/40 block mb-2 font-semibold">Description</span>
                  <div className="bg-[#1c1c1c]/50 p-4 border border-white/5 text-sm leading-relaxed text-white/70">
                    {selectedRequest.description}
                  </div>
                </div>

                <div>
                  <span className="text-[9px] uppercase tracking-widest text-white/40 block mb-2 font-semibold">Current Status</span>
                  <div className="flex justify-between items-center">
                    <span className={cn(
                      "text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 border inline-block",
                      selectedRequest.status === "Pending" ? "border-yellow-500/30 text-yellow-500 bg-yellow-500/10" :
                        selectedRequest.status === "Approved" ? "border-purple-500/30 text-purple-500 bg-purple-500/10" :
                          selectedRequest.status === "Completed" ? "border-[#8a9a5b]/30 text-[#8a9a5b] bg-[#8a9a5b]/10" :
                            selectedRequest.status === "In Progress" ? "border-blue-500/30 text-blue-500 bg-blue-500/10" : "border-red-500/30 text-red-500 bg-red-500/10"
                    )}>
                      {selectedRequest.status}
                    </span>

                    <select
                      value={selectedRequest.status}
                      onChange={(e) => updateStatus(selectedRequest.id, e.target.value)}
                      className="bg-[#1c1c1c] border border-white/20 text-white text-[10px] py-2 px-4 focus:outline-none focus:border-[#8a9a5b] cursor-pointer uppercase tracking-wider"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approve</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Complete</option>
                      <option value="Rejected">Reject</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-6 py-3 bg-[#8a9a5b] text-[#1c1c1c] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-white/10 pb-6 gap-4">
            <div>
              <p className="text-[#8a9a5b] text-[10px] uppercase tracking-[0.3em] flex items-center gap-4 mb-2">
                <span className="w-8 h-[1px] bg-[#8a9a5b]"></span>
                System Overview
              </p>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#8a9a5b]">
              <span className="animate-spin-slow"><Icons.Refresh /></span>
              <span>Live Sync Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Requests" value={requests.length} sub="Lifetime" />
            <StatCard title="Pending Review" value={requests.filter(r => r.status === "Pending").length} sub="Action Required" />
            <StatCard title="Active Projects" value={requests.filter(r => r.status === "In Progress").length} sub="Currently Running" />
            <StatCard title="Completed" value={requests.filter(r => r.status === "Completed").length} sub="Archived" />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Sidebar */}
          <div className="lg:col-span-3 flex flex-col gap-2">
            <button
              onClick={() => setActiveView("requests")}
              className={cn(
                "flex items-center gap-4 px-6 py-4 text-[11px] uppercase tracking-[0.2em] transition-all border-l-2",
                activeView === "requests"
                  ? "border-[#8a9a5b] text-[#1c1c1c] bg-[#8a9a5b] font-bold"
                  : "border-transparent text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Icons.List /> Manage Requests
            </button>

            <button
              onClick={() => setActiveView("projects")}
              className={cn(
                "flex items-center gap-4 px-6 py-4 text-[11px] uppercase tracking-[0.2em] transition-all border-l-2",
                activeView === "projects"
                  ? "border-[#8a9a5b] text-[#1c1c1c] bg-[#8a9a5b] font-bold"
                  : "border-transparent text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Icons.Grid /> Manage Projects
            </button>

            <button
              onClick={() => setActiveView("responses")}
              className={cn(
                "flex items-center gap-4 px-6 py-4 text-[11px] uppercase tracking-[0.2em] transition-all border-l-2",
                activeView === "responses"
                  ? "border-[#8a9a5b] text-[#1c1c1c] bg-[#8a9a5b] font-bold"
                  : "border-transparent text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Icons.Inbox /> Manage Responses
            </button>
          </div>

          {/* Content Panel */}
          <div className="lg:col-span-9">

            {/* VIEW: MANAGE REQUESTS */}
            {activeView === "requests" && (
              <div className="bg-[#222222] border border-white/10">
                <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[#1c1c1c]/50">
                  <h3 className="text-[11px] uppercase tracking-widest font-semibold text-white">Incoming Requests</h3>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">Page {currentPage} of {totalPages || 1}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#222222]">
                      <tr className="border-b border-white/10">
                        <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-white/40 font-medium w-32">Date</th>
                        <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-white/40 font-medium w-48">Client</th>
                        <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-white/40 font-medium">Description</th>
                        <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-white/40 font-medium w-40">Status</th>
                        <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-white/40 font-medium w-32 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loading ? (
                        <tr><td colSpan={5} className="py-8 text-center text-[10px] uppercase tracking-widest text-white/40">Loading data...</td></tr>
                      ) : currentData.length === 0 ? (
                        <tr><td colSpan={5} className="py-8 text-center text-[10px] uppercase tracking-widest text-white/40">No requests found</td></tr>
                      ) : (
                        currentData.map((req) => (
                          <tr key={req.id} className="hover:bg-white/5 transition-colors group">
                            <td className="py-4 px-6 align-top">
                              <span className="block font-mono text-[11px] text-[#8a9a5b] mb-1">#{req.id?.slice(-4)}</span>
                              <span className="text-[10px] text-white/40">{req.date}</span>
                            </td>
                            <td className="py-4 px-6 align-top">
                              <div className="text-[11px] font-medium text-white break-words">{req.userEmail}</div>
                            </td>
                            <td className="py-4 px-6 align-top max-w-sm">
                              <span className="block font-bold text-[10px] uppercase mb-1 tracking-wider text-white">{req.type}</span>
                              <p className="text-[11px] text-white/60 leading-relaxed line-clamp-2 mb-2">
                                {req.description}
                              </p>
                              <button
                                onClick={() => setSelectedRequest(req)}
                                className="text-[9px] uppercase font-bold tracking-widest text-[#8a9a5b] border-b border-[#8a9a5b]/30 hover:border-[#8a9a5b] pb-0.5 transition-colors"
                              >
                                Read More
                              </button>
                            </td>
                            <td className="py-4 px-6 align-top">
                              <span className={cn(
                                "text-[9px] uppercase font-bold tracking-widest px-2 py-1 border inline-block min-w-[80px] text-center",
                                req.status === "Pending" ? "border-yellow-500/30 text-yellow-500 bg-yellow-500/10" :
                                  req.status === "Approved" ? "border-purple-500/30 text-purple-500 bg-purple-500/10" :
                                    req.status === "Completed" ? "border-[#8a9a5b]/30 text-[#8a9a5b] bg-[#8a9a5b]/10" :
                                      req.status === "In Progress" ? "border-blue-500/30 text-blue-500 bg-blue-500/10" : "border-red-500/30 text-red-500 bg-red-500/10"
                              )}>
                                {req.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 align-top text-right">
                              <select
                                value={req.status}
                                onChange={(e) => updateStatus(req.id, e.target.value)}
                                className="bg-transparent border-b border-white/20 text-[10px] py-1 px-2 text-white focus:outline-none focus:border-[#8a9a5b] cursor-pointer uppercase tracking-wider text-right w-full"
                              >
                                <option value="Pending" className="bg-[#1c1c1c] text-white">Pending</option>
                                <option value="Approved" className="bg-[#1c1c1c] text-white">Approve</option>
                                <option value="In Progress" className="bg-[#1c1c1c] text-white">In Progress</option>
                                <option value="Completed" className="bg-[#1c1c1c] text-white">Complete</option>
                                <option value="Rejected" className="bg-[#1c1c1c] text-white">Reject</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-white/10 flex justify-between items-center bg-[#1c1c1c]/50">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/50 hover:text-[#8a9a5b] disabled:opacity-30 disabled:hover:text-white/50 transition-colors"
                    >
                      <Icons.ChevronLeft /> Previous
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={cn(
                            "w-6 h-6 flex items-center justify-center text-[10px] transition-all",
                            currentPage === i + 1
                              ? "bg-[#8a9a5b] text-[#1c1c1c] font-bold"
                              : "text-white/50 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/50 hover:text-[#8a9a5b] disabled:opacity-30 disabled:hover:text-white/50 transition-colors"
                    >
                      Next <Icons.ChevronRight />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* VIEW: PROJECT MANAGER */}
            {activeView === "projects" && (
              <div className="bg-[#222222] border border-white/10">
                <ProjectManager />
              </div>
            )}

            {/* VIEW: RESPONSE MANAGER */}
            {activeView === "responses" && (
              <div className="bg-[#222222] p-0 md:p-6 border border-white/10 overflow-hidden">
                <ResponseManager />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}