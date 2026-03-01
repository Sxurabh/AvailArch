// src/app/components/admin/ResponseManager.tsx
"use client";
import { useEffect, useState } from "react";
import { Loader2, FileText, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResponseManager() {
  const [loading, setLoading] = useState(true);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/form-responses");
      const data = await res.json();
      setHeaders(data.headers || []);
      setRows(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(rows.length / itemsPerPage);
  const currentData = rows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-white mb-2">
            Manage Responses
          </h2>
          <p className="text-[10px] text-[#8a9a5b] uppercase tracking-widest">
            Recent submissions from Google Form • Page {currentPage} of {totalPages || 1}
          </p>
        </div>
        <div className="flex gap-4">
          <a
            href="https://docs.google.com/spreadsheets/d/1P5lqL90dXz4TDqVw7mjilPDCNEgz7szrqRWfCNYZjF8/edit"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-[10px] text-white uppercase tracking-[0.2em] hover:bg-white/10 hover:border-[#8a9a5b]/50 transition-colors"
          >
            <ExternalLink size={12} />
            View Sheet
          </a>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-[#8a9a5b] text-[#1c1c1c] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-[#222222] border border-white/10 shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#8a9a5b]" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-4 text-white/30">
            <FileText size={32} />
            <p className="text-[10px] uppercase tracking-widest">No responses yet</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1c1c1c]/50 border-b border-white/10">
                    {headers.map((h, i) => (
                      <th key={i} className="p-4 text-[9px] font-bold uppercase tracking-[0.15em] text-white/50 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors last:border-0">
                      {row.map((cell, j) => (
                        <td key={j} className="p-4 text-[11px] text-white/70 align-top max-w-[300px] truncate">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
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
                  <ChevronLeft size={14} /> Previous
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
                          : "text-white/50 hover:bg-white/10"
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
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}