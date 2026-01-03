"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() { redirect("/"); },
  });

  const [requests, setRequests] = useState<any[]>([]);
  const [activeView, setActiveView] = useState("requests"); // 'requests' | 'add-project'
  
  // Project Form
  const [projectData, setProjectData] = useState({ title: "", year: "2024", category: "", image: "" });

  useEffect(() => {
    fetch("/api/requests").then(r => r.json()).then(setRequests);
  }, []);

  const updateStatus = async (id: string, newStatus: string, notes?: string) => {
    // Optimistic UI update
    setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
    
    await fetch("/api/requests", {
      method: "PATCH",
      body: JSON.stringify({ id, status: newStatus, adminNotes: notes }),
    });
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/projects", { method: "POST", body: JSON.stringify(projectData) });
    alert("Project Added to Portfolio Sheet!");
    setProjectData({ title: "", year: "2024", category: "", image: "" });
  };

  // Basic role check
  if (session?.user && (session.user as any).role !== "admin") return null;

  return (
    <div className="max-w-[1600px] mx-auto pt-12 animate-fade-in-up">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <div className="p-6 bg-black text-white">
          <h3 className="text-[10px] uppercase tracking-widest mb-1 opacity-70">Total Requests</h3>
          <p className="text-3xl font-light">{requests.length}</p>
        </div>
        <div className="p-6 border border-gray-100">
          <h3 className="text-[10px] uppercase tracking-widest mb-1 text-gray-400">Pending</h3>
          <p className="text-3xl font-light">{requests.filter(r => r.status === "Pending").length}</p>
        </div>
        <button 
          onClick={() => setActiveView("add-project")}
          className={cn("p-6 border border-gray-100 hover:bg-gray-50 text-left transition-all", activeView === "add-project" && "border-black bg-gray-50")}
        >
          <span className="text-2xl block mb-1">+</span>
          <span className="text-[10px] uppercase tracking-widest">Add Portfolio Item</span>
        </button>
        <button 
          onClick={() => setActiveView("requests")}
          className={cn("p-6 border border-gray-100 hover:bg-gray-50 text-left transition-all", activeView === "requests" && "border-black bg-gray-50")}
        >
          <span className="text-2xl block mb-1">≣</span>
          <span className="text-[10px] uppercase tracking-widest">Manage Requests</span>
        </button>
      </div>

      {activeView === "requests" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black">
                <th className="py-4 text-[10px] uppercase tracking-widest w-24">Date</th>
                <th className="py-4 text-[10px] uppercase tracking-widest w-48">Client</th>
                <th className="py-4 text-[10px] uppercase tracking-widest">Details</th>
                <th className="py-4 text-[10px] uppercase tracking-widest w-40">Status</th>
                <th className="py-4 text-[10px] uppercase tracking-widest w-24">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {requests.map((req) => (
                <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="py-4 text-gray-500 text-xs">{req.date}</td>
                  <td className="py-4 font-medium">{req.userEmail}</td>
                  <td className="py-4">
                    <span className="block font-bold text-xs uppercase mb-1">{req.type}</span>
                    <span className="text-gray-500">{req.description}</span>
                  </td>
                  <td className="py-4">
                    <span className={cn(
                      "text-[10px] uppercase tracking-wider px-2 py-1 rounded",
                      req.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                      req.status === "Approved" ? "bg-blue-100 text-blue-800" :
                      req.status === "Rejected" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                    )}>
                      {req.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <select 
                      onChange={(e) => updateStatus(req.id, e.target.value)}
                      className="bg-transparent border-b border-gray-300 text-xs focus:outline-none"
                    >
                      <option value="">Update...</option>
                      <option value="Approved">Approve</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Complete</option>
                      <option value="Rejected">Reject</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="max-w-xl">
          <h2 className="text-lg font-light uppercase tracking-widest mb-8">Add New Portfolio Project</h2>
          <form onSubmit={handleAddProject} className="space-y-6">
            <input 
              placeholder="Project Title"
              className="w-full border-b border-gray-200 py-2 outline-none focus:border-black"
              onChange={e => setProjectData({...projectData, title: e.target.value})}
              value={projectData.title}
            />
            <div className="grid grid-cols-2 gap-4">
              <input 
                placeholder="Year (e.g. 2025)"
                className="w-full border-b border-gray-200 py-2 outline-none focus:border-black"
                onChange={e => setProjectData({...projectData, year: e.target.value})}
                value={projectData.year}
              />
              <input 
                placeholder="Category (e.g. Interior)"
                className="w-full border-b border-gray-200 py-2 outline-none focus:border-black"
                onChange={e => setProjectData({...projectData, category: e.target.value})}
                value={projectData.category}
              />
            </div>
            <input 
              placeholder="Image URL (Unsplash or hosted link)"
              className="w-full border-b border-gray-200 py-2 outline-none focus:border-black"
              onChange={e => setProjectData({...projectData, image: e.target.value})}
              value={projectData.image}
            />
            <button className="bg-black text-white px-8 py-3 text-[10px] uppercase tracking-[0.2em] hover:opacity-80">
              Save to Database
            </button>
          </form>
        </div>
      )}
    </div>
  );
}