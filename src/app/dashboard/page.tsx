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
  Download: (props?: any) => <svg className={props?.className || "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>,
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
  const [requestTab, setRequestTab] = useState<"incoming" | "archived">("incoming");
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
    let notes: string | null | undefined = undefined;

    if (newStatus === "Rejected") {
      const reason = window.prompt("Please detail the reason for rejection (this will be visible to the client):");
      if (reason === null) return; // Cancelled
      notes = reason;
      setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus, adminNotes: notes } : r));
    } else {
      notes = null;
      setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus, adminNotes: null } : r));
    }

    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest((prev: any) => ({ ...prev, status: newStatus, adminNotes: notes !== undefined ? notes : prev.adminNotes }));
    }

    await fetch("/api/requests", {
      method: "PATCH",
      body: JSON.stringify({ id, status: newStatus, adminNotes: notes }),
    });
  };

  // Archive Request
  const archiveRequest = async (id: string, isArchived: boolean) => {
    setRequests(requests.map(r => r.id === id ? { ...r, isArchived } : r));
    if (selectedRequest?.id === id) setSelectedRequest({ ...selectedRequest, isArchived });

    await fetch("/api/requests", {
      method: "PATCH",
      body: JSON.stringify({ id, isArchived }),
    });
  };

  // Download All Attachments
  const downloadAllAttachments = async (urls: string[]) => {
    try {
      for (const url of urls) {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;

        // Extract filename from URL or generate one
        const filename = url.split("/").pop()?.split("?")[0] || `attachment-${Date.now()}`;
        a.download = filename;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);

        // Slight delay to prevent browser capping multiple downloads
        await new Promise(r => setTimeout(r, 200));
      }
    } catch (error) {
      console.error("Failed to download attachments:", error);
      alert("Failed to download some attachments. Please try downloading them individually.");
    }
  };

  if (userLoading) return <div className="p-12 text-center text-gray-500 uppercase text-xs tracking-widest">Loading Dashboard...</div>;
  if (user && user.role !== "admin") return <div className="p-12 text-center text-red-500 uppercase text-xs tracking-widest">Access Denied</div>;

  // Pagination Logic
  const filteredRequests = requests.filter(r => requestTab === "archived" ? r.isArchived : !r.isArchived);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const currentData = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const StatCard = ({ title, value, sub }: { title: string, value: string | number, sub?: string }) => (
    <div className="bg-[rgba(var(--fg),0.05)] border border-[rgba(var(--fg),0.1)] p-6 flex flex-col justify-between h-32 hover:border-[#8a9a5b]/50 transition-colors duration-300">
      <h3 className="text-[10px] uppercase tracking-[0.2em] text-[rgba(var(--fg),0.5)] font-semibold">{title}</h3>
      <div>
        <p className="text-3xl font-light tracking-tight text-[rgba(var(--fg),1)]">{value}</p>
        {sub && <p className="text-[10px] text-[#8a9a5b] mt-1 uppercase tracking-wider">{sub}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] pt-24 pb-24 px-6 md:px-12 font-sans selection:bg-[#8a9a5b]" style={{ background: 'rgb(var(--bg-surface))', color: 'rgb(var(--fg))' }}>
      <div className="max-w-[1600px] mx-auto relative">

        {/* --- Request Detail Modal --- */}
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(var(--bg),1)]/80 backdrop-blur-sm" onClick={() => setSelectedRequest(null)}>
            <div
              className="bg-[rgba(var(--bg-surface),1)] w-full max-w-2xl p-8 shadow-2xl border border-[rgba(var(--fg),0.1)] relative animate-in fade-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedRequest(null)}
                className="absolute top-6 right-6 text-[rgba(var(--fg),0.4)] hover:text-[rgba(var(--fg),1)] transition-colors"
              >
                <Icons.Close />
              </button>

              <div className="mb-6 border-b border-[rgba(var(--fg),0.1)] pb-4">
                <h3 className="text-xl uppercase tracking-[0.15em] font-light text-[rgba(var(--fg),1)] mb-1">Request Details</h3>
                <p className="text-[10px] text-[#8a9a5b] uppercase tracking-widest">
                  ID: #{selectedRequest.id?.slice(-4)} • {selectedRequest.date}
                </p>
              </div>

              <div className="space-y-6">

                <div className="pb-6 border-b border-[rgba(var(--fg),0.1)]">
                  <span className="text-[9px] uppercase tracking-widest text-[rgba(var(--fg),0.4)] block mb-2 font-semibold">Client</span>
                  <p className="text-sm font-medium text-[rgba(var(--fg),1)] break-words">{selectedRequest.userEmail}</p>
                </div>

                {/* Category + Type */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[rgba(var(--fg),0.4)] block mb-2 font-semibold">Category</span>
                    <span className="text-[10px] uppercase tracking-widest px-2 py-1 border font-bold inline-block" style={{ borderColor: 'rgba(var(--fg),0.2)', color: 'rgba(var(--fg),1)' }}>
                      {selectedRequest.projectCategory === 'commercial' ? '🏢 Commercial' : '🏠 Residential'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[rgba(var(--fg),0.4)] block mb-2 font-semibold">
                      {selectedRequest.projectCategory === 'commercial' ? 'Type' : 'BHK'}
                    </span>
                    <p className="text-sm font-medium text-[rgba(var(--fg),1)]">
                      {selectedRequest.projectCategory === 'commercial' ? (selectedRequest.commercialType || '—') : (selectedRequest.bhk ? `${selectedRequest.bhk} BHK` : '—')}
                    </p>
                  </div>
                </div>

                {/* Contact + Location + Area */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {selectedRequest.contactNo && (
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-[rgba(var(--fg),0.4)] block mb-2 font-semibold">Contact</span>
                      <p className="text-sm text-[rgba(var(--fg),1)]">{selectedRequest.contactNo}</p>
                    </div>
                  )}
                  {selectedRequest.projectLocation && (
                    <div className="col-span-2 md:col-span-1">
                      <span className="text-[9px] uppercase tracking-widest text-[rgba(var(--fg),0.4)] block mb-2 font-semibold">Location</span>
                      <p className="text-sm text-[rgba(var(--fg),1)]">{selectedRequest.projectLocation}</p>
                    </div>
                  )}
                  {selectedRequest.areaValue && (
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-[rgba(var(--fg),0.4)] block mb-2 font-semibold">Area</span>
                      <p className="text-sm text-[rgba(var(--fg),1)]">{selectedRequest.areaValue} {selectedRequest.areaUnit === 'sqmt' ? 'Sq. Mt' : 'Sq. Ft'}</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-[rgba(var(--fg),0.4)] block mb-2 font-semibold">Description</span>
                  <div className="bg-[rgba(var(--bg),1)]/50 p-4 border border-[rgba(var(--fg),0.05)] text-sm leading-relaxed text-[rgba(var(--fg),0.7)]">
                    {selectedRequest.description || '—'}
                  </div>
                </div>

                {/* Plan Images */}
                {selectedRequest.planImages && selectedRequest.planImages.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] uppercase tracking-widest text-[rgba(var(--fg),0.4)] font-semibold">Plan Attachments</span>
                      <button
                        onClick={() => downloadAllAttachments(selectedRequest.planImages)}
                        className="text-[9px] uppercase font-bold tracking-widest text-[#8a9a5b] border border-[#8a9a5b]/30 hover:border-[#8a9a5b] px-2 py-1 transition-colors flex items-center gap-1"
                      >
                        <Icons.Download className="w-3 h-3" /> Download All
                      </button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {selectedRequest.planImages.map((url: string, i: number) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="w-16 h-16 border border-[rgba(var(--fg),0.1)] overflow-hidden block hover:opacity-80 transition-opacity">
                          {url.endsWith('.pdf') ? (
                            <div className="w-full h-full flex items-center justify-center text-xs text-[rgba(var(--fg),0.5)]">PDF</div>
                          ) : (
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status */}
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-[rgba(var(--fg),0.4)] block mb-2 font-semibold">Current Status</span>
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
                      className="bg-[rgba(var(--bg),1)] border border-[rgba(var(--fg),0.2)] text-[rgba(var(--fg),1)] text-[10px] py-2 px-4 focus:outline-none focus:border-[#8a9a5b] cursor-pointer uppercase tracking-wider"
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

              <div className="mt-8 pt-4 border-t border-[rgba(var(--fg),0.1)] flex justify-end">
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-[rgba(var(--fg),0.1)] pb-6 gap-4">
            <div>
              <p className="text-[#8a9a5b] text-[10px] uppercase tracking-[0.3em] flex items-center gap-4 mb-2">
                <span className="w-8 h-[1px] bg-[#8a9a5b]"></span>
                System Overview
              </p>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[rgba(var(--fg),1)] leading-none">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#8a9a5b]">
              <span className="animate-spin-slow"><Icons.Refresh /></span>
              <span>Live Sync Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Requests" value={requests.length} sub="Lifetime" />
            <StatCard title="Pending Review" value={requests.filter(r => r.status === "Pending" && !r.isArchived).length} sub="Action Required" />
            <StatCard title="Active Projects" value={requests.filter(r => r.status === "In Progress" && !r.isArchived).length} sub="Currently Running" />
            <StatCard title="Archived" value={requests.filter(r => r.isArchived).length} sub="Storage" />
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
                  : "border-transparent text-[rgba(var(--fg),0.5)] hover:text-[rgba(var(--fg),1)] hover:bg-[rgba(var(--fg),0.05)]"
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
                  : "border-transparent text-[rgba(var(--fg),0.5)] hover:text-[rgba(var(--fg),1)] hover:bg-[rgba(var(--fg),0.05)]"
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
                  : "border-transparent text-[rgba(var(--fg),0.5)] hover:text-[rgba(var(--fg),1)] hover:bg-[rgba(var(--fg),0.05)]"
              )}
            >
              <Icons.Inbox /> Manage Responses
            </button>
          </div>

          {/* Content Panel */}
          <div className="lg:col-span-9 h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar pr-2 min-h-[600px]" data-lenis-prevent>

            {/* VIEW: MANAGE REQUESTS */}
            {activeView === "requests" && (
              <div className="bg-[rgba(var(--bg-surface),1)] border border-[rgba(var(--fg),0.1)]">
                <div className="px-6 py-4 border-b border-[rgba(var(--fg),0.1)] flex md:justify-between items-start md:items-center bg-[rgba(var(--bg),1)]/50 flex-col md:flex-row gap-4">
                  <div className="flex gap-6 overflow-x-auto w-full md:w-auto pb-1">
                    <button
                      onClick={() => { setRequestTab("incoming"); setCurrentPage(1); }}
                      className={cn("text-[11px] uppercase tracking-widest font-semibold pb-1 transition-colors whitespace-nowrap", requestTab === "incoming" ? "text-[rgba(var(--fg),1)] border-b-2 border-[#8a9a5b]" : "text-[rgba(var(--fg),0.5)]")}
                    >
                      Incoming Requests
                    </button>
                    <button
                      onClick={() => { setRequestTab("archived"); setCurrentPage(1); }}
                      className={cn("text-[11px] uppercase tracking-widest font-semibold pb-1 transition-colors whitespace-nowrap", requestTab === "archived" ? "text-[rgba(var(--fg),1)] border-b-2 border-[#8a9a5b]" : "text-[rgba(var(--fg),0.5)]")}
                    >
                      Archived Requests
                    </button>
                  </div>
                  <span className="text-[10px] text-[rgba(var(--fg),0.4)] uppercase tracking-widest whitespace-nowrap">Page {currentPage} of {totalPages || 1}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[rgba(var(--bg-surface),1)]">
                      <tr className="border-b border-[rgba(var(--fg),0.1)]">
                        <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-[rgba(var(--fg),0.4)] font-medium w-32">Date</th>
                        <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-[rgba(var(--fg),0.4)] font-medium w-48">Client</th>
                        <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-[rgba(var(--fg),0.4)] font-medium">Description</th>
                        <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-[rgba(var(--fg),0.4)] font-medium w-40">Status</th>
                        <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-[rgba(var(--fg),0.4)] font-medium w-32 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loading ? (
                        Array.from({ length: 4 }).map((_, idx) => (
                          <tr key={idx} className="animate-pulse border-b border-[rgba(var(--fg),0.05)]">
                            <td className="py-6 px-6"><div className="h-3 w-16 bg-[rgba(var(--fg),0.1)] rounded" /></td>
                            <td className="py-6 px-6"><div className="h-3 w-32 bg-[rgba(var(--fg),0.1)] rounded" /></td>
                            <td className="py-6 px-6">
                              <div className="h-3 w-3/4 bg-[rgba(var(--fg),0.1)] rounded mb-2" />
                              <div className="h-3 w-1/2 bg-[rgba(var(--fg),0.1)] rounded" />
                            </td>
                            <td className="py-6 px-6"><div className="h-6 w-20 bg-[rgba(var(--fg),0.1)] rounded" /></td>
                            <td className="py-6 px-6 text-right"><div className="h-10 w-full bg-[rgba(var(--fg),0.1)] rounded" /></td>
                          </tr>
                        ))
                      ) : currentData.length === 0 ? (
                        <tr><td colSpan={5} className="py-8 text-center text-[10px] uppercase tracking-widest text-[rgba(var(--fg),0.4)]">No requests found</td></tr>
                      ) : (
                        currentData.map((req) => (
                          <tr key={req.id} className="hover:bg-[rgba(var(--fg),0.05)] transition-colors group">
                            <td className="py-4 px-6 align-top">
                              <span className="block font-mono text-[11px] text-[#8a9a5b] mb-1">#{req.id?.slice(-4)}</span>
                              <span className="text-[10px] text-[rgba(var(--fg),0.4)]">{req.date}</span>
                            </td>
                            <td className="py-4 px-6 align-top">
                              <div className="text-[11px] font-medium text-[rgba(var(--fg),1)] break-words">{req.userEmail}</div>
                            </td>
                            <td className="py-4 px-6 align-top max-w-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 border border-[rgba(var(--fg),0.15)] font-bold text-[rgba(var(--fg),0.6)]">
                                  {req.projectCategory === 'commercial' ? '🏢' : '🏠'} {req.projectCategory || 'residential'}
                                </span>
                                {req.projectCategory === 'commercial' && req.commercialType && (
                                  <span className="text-[10px] text-[rgba(var(--fg),0.5)]">{req.commercialType}</span>
                                )}
                                {req.projectCategory === 'residential' && req.bhk && (
                                  <span className="text-[10px] text-[rgba(var(--fg),0.5)]">{req.bhk} BHK</span>
                                )}
                              </div>
                              {req.projectLocation && (
                                <p className="text-[10px] text-[rgba(var(--fg),0.4)] mb-1">📍 {req.projectLocation}</p>
                              )}
                              <p className="text-[11px] text-[rgba(var(--fg),0.6)] leading-relaxed line-clamp-2 mb-2">
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
                              <div className="flex flex-col flex-wrap gap-2 w-full max-w-[120px] ml-auto">
                                <select
                                  value={req.status}
                                  onChange={(e) => updateStatus(req.id, e.target.value)}
                                  className="bg-transparent border-b border-[rgba(var(--fg),0.2)] text-[10px] py-1 px-1 text-[rgba(var(--fg),1)] focus:outline-none focus:border-[#8a9a5b] cursor-pointer uppercase tracking-wider text-right w-full"
                                >
                                  <option value="Pending" className="bg-[rgba(var(--bg),1)] text-[rgba(var(--fg),1)]">Pending</option>
                                  <option value="Approved" className="bg-[rgba(var(--bg),1)] text-[rgba(var(--fg),1)]">Approve</option>
                                  <option value="In Progress" className="bg-[rgba(var(--bg),1)] text-[rgba(var(--bg),1)]">In Progress</option>
                                  <option value="Completed" className="bg-[rgba(var(--bg),1)] text-[rgba(var(--fg),1)]">Complete</option>
                                  <option value="Rejected" className="bg-[rgba(var(--bg),1)] text-[rgba(var(--fg),1)]">Reject</option>
                                </select>
                                <button
                                  onClick={() => archiveRequest(req.id, !req.isArchived)}
                                  className="text-[9px] uppercase tracking-widest border border-[rgba(var(--fg),0.2)] hover:border-[#8a9a5b] text-[rgba(var(--fg),0.7)] hover:text-[rgba(var(--fg),1)] py-1.5 px-2 transition-colors w-full text-center"
                                >
                                  {req.isArchived ? "Unarchive" : "Archive"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-[rgba(var(--fg),0.1)] flex justify-between items-center bg-[rgba(var(--bg),1)]/50">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[rgba(var(--fg),0.5)] hover:text-[#8a9a5b] disabled:opacity-30 disabled:hover:text-[rgba(var(--fg),0.5)] transition-colors"
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
                              : "text-[rgba(var(--fg),0.5)] hover:bg-[rgba(var(--fg),0.1)] hover:text-[rgba(var(--fg),1)]"
                          )}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[rgba(var(--fg),0.5)] hover:text-[#8a9a5b] disabled:opacity-30 disabled:hover:text-[rgba(var(--fg),0.5)] transition-colors"
                    >
                      Next <Icons.ChevronRight />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* VIEW: PROJECT MANAGER */}
            {activeView === "projects" && (
              <div className="bg-[rgba(var(--bg-surface),1)] border border-[rgba(var(--fg),0.1)]">
                <ProjectManager />
              </div>
            )}

            {/* VIEW: RESPONSE MANAGER */}
            {activeView === "responses" && (
              <div className="bg-[rgba(var(--bg-surface),1)] p-0 md:p-6 border border-[rgba(var(--fg),0.1)] overflow-hidden">
                <ResponseManager />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}