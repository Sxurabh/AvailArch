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
    <div className="bg-white border border-gray-200 p-6 flex flex-col justify-between h-32 hover:border-black transition-colors duration-300">
      <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold">{title}</h3>
      <div>
        <p className="text-3xl font-light tracking-tight text-black">{value}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">{sub}</p>}
      </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto pt-12 pb-24 animate-fade-in-up px-6 md:px-0 relative">

      {/* --- Request Detail Modal --- */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedRequest(null)}>
          <div
            className="bg-white w-full max-w-2xl p-8 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"
            >
              <Icons.Close />
            </button>

            <div className="mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-xl uppercase tracking-[0.15em] font-light text-black mb-1">Request Details</h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                ID: #{selectedRequest.id?.slice(-4)} • {selectedRequest.date}
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-2 font-semibold">Client</span>
                  <p className="text-sm font-medium text-black break-words">{selectedRequest.userEmail}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-2 font-semibold">Project Type</span>
                  <p className="text-sm font-medium text-black">{selectedRequest.type}</p>
                </div>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-2 font-semibold">Description</span>
                <div className="bg-gray-50 p-4 border border-gray-100 text-sm leading-relaxed text-gray-600">
                  {selectedRequest.description}
                </div>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-2 font-semibold">Current Status</span>
                <div className="flex justify-between items-center">
                  <span className={cn(
                    "text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-sm border inline-block",
                    selectedRequest.status === "Pending" ? "border-yellow-200 text-yellow-700 bg-yellow-50" :
                      selectedRequest.status === "Approved" ? "border-purple-200 text-purple-700 bg-purple-50" :
                        selectedRequest.status === "Completed" ? "border-green-200 text-green-700 bg-green-50" :
                          selectedRequest.status === "In Progress" ? "border-blue-200 text-blue-700 bg-blue-50" : "border-red-200 text-red-700 bg-red-50"
                  )}>
                    {selectedRequest.status}
                  </span>

                  <select
                    value={selectedRequest.status}
                    onChange={(e) => updateStatus(selectedRequest.id, e.target.value)}
                    className="bg-white border-b border-gray-300 text-[10px] py-1 px-4 focus:outline-none focus:border-black cursor-pointer uppercase tracking-wider"
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

            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-6 py-2 bg-black text-white text-[10px] uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-12">
        <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
          <div>
            <h1 className="text-2xl font-light uppercase tracking-widest text-black mb-2">Admin Dashboard</h1>
            <p className="text-xs text-gray-400 tracking-wider">OVERVIEW & MANAGEMENT</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400">
            <span className="animate-spin-slow"><Icons.Refresh /></span>
            <span>Live Sync Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              "flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.15em] transition-all border-l-2",
              activeView === "requests"
                ? "border-black text-black bg-gray-50 font-semibold"
                : "border-transparent text-gray-400 hover:text-black hover:bg-gray-50/50"
            )}
          >
            <Icons.List /> Manage Requests
          </button>

          <button
            onClick={() => setActiveView("projects")}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.15em] transition-all border-l-2",
              activeView === "projects"
                ? "border-black text-black bg-gray-50 font-semibold"
                : "border-transparent text-gray-400 hover:text-black hover:bg-gray-50/50"
            )}
          >
            <Icons.Grid /> Manage Projects
          </button>

          <button
            onClick={() => setActiveView("responses")}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.15em] transition-all border-l-2",
              activeView === "responses"
                ? "border-black text-black bg-gray-50 font-semibold"
                : "border-transparent text-gray-400 hover:text-black hover:bg-gray-50/50"
            )}
          >
            <Icons.Inbox /> Manage Responses
          </button>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-9">

          {/* VIEW: MANAGE REQUESTS */}
          {activeView === "requests" && (
            <div className="bg-white border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                <h3 className="text-[11px] uppercase tracking-widest font-semibold text-black">Incoming Requests</h3>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">Page {currentPage} of {totalPages || 1}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white">
                    <tr className="border-b border-gray-100">
                      <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-gray-400 font-medium w-32">Date</th>
                      <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-gray-400 font-medium w-48">Client</th>
                      <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Description</th>
                      <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-gray-400 font-medium w-40">Status</th>
                      <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-gray-400 font-medium w-32 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <tr><td colSpan={5} className="py-8 text-center text-[10px] uppercase tracking-widest text-gray-400">Loading data...</td></tr>
                    ) : currentData.length === 0 ? (
                      <tr><td colSpan={5} className="py-8 text-center text-[10px] uppercase tracking-widest text-gray-400">No requests found</td></tr>
                    ) : (
                      currentData.map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="py-4 px-6 align-top">
                            <span className="block font-mono text-[11px] text-black mb-1">#{req.id?.slice(-4)}</span>
                            <span className="text-[10px] text-gray-400">{req.date}</span>
                          </td>
                          <td className="py-4 px-6 align-top">
                            <div className="text-[11px] font-medium text-gray-900 break-words">{req.userEmail}</div>
                          </td>
                          <td className="py-4 px-6 align-top max-w-sm">
                            <span className="block font-bold text-[10px] uppercase mb-1 tracking-wider text-black">{req.type}</span>
                            <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2 mb-2">
                              {req.description}
                            </p>
                            <button
                              onClick={() => setSelectedRequest(req)}
                              className="text-[9px] uppercase font-bold tracking-widest border-b border-black pb-0.5 hover:text-gray-600 transition-colors"
                            >
                              Read More
                            </button>
                          </td>
                          <td className="py-4 px-6 align-top">
                            <span className={cn(
                              "text-[9px] uppercase font-bold tracking-widest px-2 py-1 rounded-sm border inline-block min-w-[80px] text-center",
                              req.status === "Pending" ? "border-yellow-200 text-yellow-700 bg-yellow-50" :
                                req.status === "Approved" ? "border-purple-200 text-purple-700 bg-purple-50" :
                                  req.status === "Completed" ? "border-green-200 text-green-700 bg-green-50" :
                                    req.status === "In Progress" ? "border-blue-200 text-blue-700 bg-blue-50" : "border-red-200 text-red-700 bg-red-50"
                            )}>
                              {req.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 align-top text-right">
                            <select
                              value={req.status}
                              onChange={(e) => updateStatus(req.id, e.target.value)}
                              className="bg-transparent border-b border-gray-300 text-[10px] py-1 px-2 focus:outline-none focus:border-black cursor-pointer uppercase tracking-wider text-right w-full"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Approved">Approve</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Complete</option>
                              <option value="Rejected">Reject</option>
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
                <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/30">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 hover:text-black disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                  >
                    <Icons.ChevronLeft /> Previous
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={cn(
                          "w-6 h-6 flex items-center justify-center text-[10px] rounded-full transition-all",
                          currentPage === i + 1
                            ? "bg-black text-white font-bold"
                            : "text-gray-400 hover:bg-gray-100"
                        )}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 hover:text-black disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                  >
                    Next <Icons.ChevronRight />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW: PROJECT MANAGER */}
          {activeView === "projects" && (
            <div className="bg-white border border-gray-200">
              <ProjectManager />
            </div>
          )}

          {/* VIEW: RESPONSE MANAGER */}
          {activeView === "responses" && (
            <div className="bg-white p-6 border border-gray-200">
              <ResponseManager />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}