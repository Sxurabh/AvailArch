"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

// --- Icons (Inline SVGs for performance) ---
const Icons = {
  Grid: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  List: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>,
  Plus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
  ChevronLeft: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
  Refresh: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
};

export default function AdminDashboard() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() { redirect("/"); },
  });

  const [requests, setRequests] = useState<any[]>([]);
  const [activeView, setActiveView] = useState("requests");
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Project Form State
  const [projectData, setProjectData] = useState({ title: "", year: "2024", category: "", image: "" });

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

  const updateStatus = async (id: string, newStatus: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
    await fetch("/api/requests", {
      method: "PATCH",
      body: JSON.stringify({ id, status: newStatus }),
    });
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/projects", { method: "POST", body: JSON.stringify(projectData) });
    alert("Project Added Successfully");
    setProjectData({ title: "", year: "2024", category: "", image: "" });
  };

  if (session?.user && (session.user as any).role !== "admin") return null;

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
    <div className="max-w-[1600px] mx-auto pt-12 pb-24 animate-fade-in-up px-6 md:px-0">
      
      {/* 1. Header & Stats Section */}
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

      {/* 2. Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Sidebar Tabs */}
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
            onClick={() => setActiveView("add-project")}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.15em] transition-all border-l-2",
              activeView === "add-project" 
                ? "border-black text-black bg-gray-50 font-semibold" 
                : "border-transparent text-gray-400 hover:text-black hover:bg-gray-50/50"
            )}
          >
            <Icons.Grid /> Add Portfolio Item
          </button>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-9">
          {activeView === "requests" ? (
            <div className="bg-white border border-gray-200">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                <h3 className="text-[11px] uppercase tracking-widest font-semibold text-black">Incoming Requests</h3>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
              </div>

              {/* Table */}
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
                            <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                              {req.description}
                            </p>
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
          ) : (
            <div className="bg-white border border-gray-200 p-8 max-w-2xl">
              <div className="mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-lg font-light uppercase tracking-widest mb-2">New Portfolio Entry</h2>
                <p className="text-xs text-gray-400">Add a completed project to the public showcase.</p>
              </div>
              
              <form onSubmit={handleAddProject} className="space-y-8">
                <div className="space-y-4">
                  <div className="group">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-black transition-colors">Project Title</label>
                    <input 
                      required
                      placeholder="E.g. The Eos Studio"
                      className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black focus:bg-white transition-all placeholder:text-gray-300"
                      onChange={e => setProjectData({...projectData, title: e.target.value})}
                      value={projectData.title}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-black transition-colors">Year</label>
                      <input 
                        placeholder="2025"
                        className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black focus:bg-white transition-all placeholder:text-gray-300"
                        onChange={e => setProjectData({...projectData, year: e.target.value})}
                        value={projectData.year}
                      />
                    </div>
                    <div className="group">
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-black transition-colors">Category</label>
                      <input 
                        placeholder="Interior / Landscape"
                        className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black focus:bg-white transition-all placeholder:text-gray-300"
                        onChange={e => setProjectData({...projectData, category: e.target.value})}
                        value={projectData.category}
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-black transition-colors">Image Source</label>
                    <input 
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black focus:bg-white transition-all placeholder:text-gray-300"
                      onChange={e => setProjectData({...projectData, image: e.target.value})}
                      value={projectData.image}
                    />
                    <p className="text-[9px] text-gray-400 mt-2 uppercase tracking-wide">Use a direct URL from Unsplash or your hosting provider.</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button className="bg-black text-white px-8 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all flex items-center gap-3">
                    <Icons.Plus /> Publish Project
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}