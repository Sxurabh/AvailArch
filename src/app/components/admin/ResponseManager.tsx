"use client";
import { useEffect, useState } from "react";
import { Loader2, FileText, ExternalLink } from "lucide-react";

export default function ResponseManager() {
  const [loading, setLoading] = useState(true);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);

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

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-black mb-2">
            Manage Responses
          </h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
            Recent submissions from Google Form
          </p>
        </div>
        <div className="flex gap-4">
           <a 
            href="https://docs.google.com/spreadsheets/d/1P5lqL90dXz4TDqVw7mjilPDCNEgz7szrqRWfCNYZjF8/edit"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 transition-colors"
          >
            <ExternalLink size={12} />
            View Sheet
          </a>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-black text-white text-[10px] uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-4 text-gray-300">
            <FileText size={32} />
            <p className="text-[10px] uppercase tracking-widest">No responses yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {headers.map((h, i) => (
                    <th key={i} className="p-4 text-[9px] font-bold uppercase tracking-[0.15em] text-gray-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0">
                    {row.map((cell, j) => (
                      <td key={j} className="p-4 text-[11px] text-gray-700 align-top max-w-[300px] truncate">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}