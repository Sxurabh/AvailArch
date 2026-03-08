"use client";
import { useUser } from "@/hooks/useUser";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";

// ── Constants ────────────────────────────────────────────────────
const BHK_OPTIONS = ["1", "2", "2.5", "3", "3.5", "4", "5"];
const COMMERCIAL_TYPES = [
  "Shop", "Medical", "Supermarket", "Clinic", "Restaurant",
  "Office", "Showroom", "Warehouse", "Other",
];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".heic", ".pdf"];
const ALLOWED_MIME_TYPES = [
  "image/jpeg", "image/png", "image/heic", "image/heif", "application/pdf",
];
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const MAX_FILES = 10;

// ── Types ────────────────────────────────────────────────────────
type ProjectCategory = "residential" | "commercial";

interface FormState {
  projectCategory: ProjectCategory;
  commercialType: string;
  contactNo: string;
  projectLocation: string;
  bhk: string;
  areaValue: string;
  areaUnit: "sqft" | "sqmt";
  description: string;
}

interface UploadedFile {
  file: File;
  preview: string | null;
  uploading: boolean;
  url: string | null;
  error: string | null;
}

const INITIAL_FORM: FormState = {
  projectCategory: "residential",
  commercialType: "Shop",
  contactNo: "",
  projectLocation: "",
  bhk: "2",
  areaValue: "",
  areaUnit: "sqft",
  description: "",
};

// ── Helpers ──────────────────────────────────────────────────────
const isPdf = (file: File) => file.type === "application/pdf";
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ================================================================
// COMPONENT
// ================================================================
export default function TrackRequestPage() {
  const { user, loading: userLoading } = useUser();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");

  // Form state
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth redirect
  useEffect(() => {
    if (!userLoading && !user) redirect("/");
  }, [user, userLoading]);

  // Fetch request history
  useEffect(() => {
    if (activeTab === "history") {
      setLoading(true);
      fetch("/api/requests")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setRequests(data);
          setLoading(false);
        });
    }
  }, [activeTab]);

  // ── Field updater ────────────────────────────────────────────
  const updateField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // ── File handling ────────────────────────────────────────────
  const handleFileSelect = (incoming: FileList | null) => {
    if (!incoming) return;
    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < incoming.length; i++) {
      const file = incoming[i];
      if (files.length + newFiles.length >= MAX_FILES) break;

      // Validate MIME
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext !== "heic") {
          alert(`"${file.name}" is not an allowed file type.\nAllowed: JPEG, PNG, HEIC, PDF`);
          continue;
        }
      }

      if (file.size > MAX_FILE_SIZE) {
        alert(`"${file.name}" exceeds the 15MB limit.`);
        continue;
      }

      const preview = isPdf(file) ? null : URL.createObjectURL(file);
      newFiles.push({ file, preview, uploading: false, url: null, error: null });
    }

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      if (updated[index].preview) URL.revokeObjectURL(updated[index].preview!);
      updated.splice(index, 1);
      return updated;
    });
  };

  // ── Drop zone ────────────────────────────────────────────────
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  // ── Upload files to Supabase ─────────────────────────────────
  const uploadFiles = async (): Promise<string[]> => {
    if (files.length === 0) return [];

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f.file));

    const res = await fetch("/api/upload?bucket=request-images", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Upload failed");
    }

    const data = await res.json();
    return data.images.map((img: any) => img.optimizedUrl);
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      // 1) Upload plan images
      const imageUrls = await uploadFiles();

      // 2) Create request
      const payload = {
        projectCategory: form.projectCategory,
        commercialType: form.projectCategory === "commercial" ? form.commercialType : null,
        contactNo: form.contactNo,
        projectLocation: form.projectLocation,
        bhk: form.projectCategory === "residential" ? form.bhk : null,
        areaValue: form.areaValue || null,
        areaUnit: form.areaUnit,
        description: form.description,
        planImages: imageUrls,
      };

      const res = await fetch("/api/requests", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to submit request");

      // Reset
      setForm(INITIAL_FORM);
      setFiles([]);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab("history");
      }, 2000);
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────
  if (userLoading) {
    return (
      <div className="max-w-4xl mx-auto pt-12 pb-24 px-6 min-h-[60vh]">
        <div className="h-8 w-48 bg-[rgba(var(--fg),0.05)] rounded mb-4 animate-pulse" />
        <div className="h-4 w-64 bg-[rgba(var(--fg),0.05)] rounded mb-12 animate-pulse" />
        <div className="flex gap-8 mb-10 border-b border-[rgba(var(--border))]">
          <div className="h-8 w-24 bg-[rgba(var(--fg),0.05)] rounded animate-pulse" />
          <div className="h-8 w-24 bg-[rgba(var(--fg),0.05)] rounded animate-pulse" />
        </div>
        <div className="space-y-6">
          <div className="h-12 w-full bg-[rgba(var(--fg),0.05)] rounded animate-pulse" />
          <div className="h-12 w-full bg-[rgba(var(--fg),0.05)] rounded animate-pulse" />
          <div className="h-32 w-full bg-[rgba(var(--fg),0.05)] rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // ── Shared input style ───────────────────────────────────────
  const inputCls = "w-full py-2.5 px-0 text-sm bg-transparent focus:outline-none border-b transition-colors";
  const inputStyle = { borderColor: "rgb(var(--border))", color: "rgb(var(--fg))" };
  const labelCls = "block text-[10px] uppercase tracking-[0.15em] font-bold mb-2";
  const labelStyle = { color: "rgb(var(--fg-muted))" };

  // ================================================================
  // RENDER
  // ================================================================
  return (
    <div className="max-w-4xl mx-auto pt-12 pb-24 px-6 animate-fade-in-up min-h-[60vh]">
      <h1 className="text-2xl font-light uppercase tracking-widest mb-2" style={{ color: "rgb(var(--fg))" }}>
        Client Portal
      </h1>
      <p className="text-xs mb-12" style={{ color: "rgb(var(--fg-muted))" }}>
        Welcome, {user?.user_metadata?.name || user?.email}
      </p>

      {/* ── TABS ───────────────────────────────────────────────── */}
      <div className="flex gap-8 mb-10 border-b" style={{ borderColor: "rgb(var(--border))" }}>
        {(["new", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="pb-3 text-[10px] uppercase tracking-[0.2em] transition-all"
            style={{
              color: activeTab === tab ? "rgb(var(--fg))" : "rgb(var(--fg-muted))",
              fontWeight: activeTab === tab ? "700" : "400",
              borderBottom: activeTab === tab ? "1px solid rgb(var(--fg))" : "none",
            }}
          >
            {tab === "new" ? "Start New Project" : "Request History"}
          </button>
        ))}
      </div>

      {/* ================================================================ */}
      {/* NEW REQUEST FORM                                                 */}
      {/* ================================================================ */}
      {activeTab === "new" ? (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">

          {/* ── CATEGORY CARDS ────────────────────────────────── */}
          <div>
            <label className={labelCls} style={labelStyle}>Project Category</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(["residential", "commercial"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => updateField("projectCategory", cat)}
                  className={cn(
                    "py-4 px-5 border text-left transition-all duration-200",
                    form.projectCategory === cat
                      ? "border-[rgb(var(--fg))] shadow-sm"
                      : "border-[rgb(var(--border))] hover:border-[rgb(var(--fg-muted))]"
                  )}
                  style={{
                    background: form.projectCategory === cat
                      ? "rgba(var(--fg), 0.04)"
                      : "transparent",
                  }}
                >
                  <span
                    className="block text-xs font-bold uppercase tracking-widest"
                    style={{
                      color: form.projectCategory === cat
                        ? "rgb(var(--fg))"
                        : "rgb(var(--fg-muted))",
                    }}
                  >
                    {cat === "residential" ? "🏠 Residential" : "🏢 Commercial"}
                  </span>
                  <span className="block mt-1 text-[10px]" style={{ color: "rgb(var(--fg-muted))" }}>
                    {cat === "residential"
                      ? "Home, Apartment, Villa"
                      : "Office, Shop, Medical"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── COMMERCIAL TYPE (conditional) ─────────────────── */}
          {form.projectCategory === "commercial" && (
            <div>
              <label className={labelCls} style={labelStyle}>Commercial Type</label>
              <select
                value={form.commercialType}
                onChange={(e) => updateField("commercialType", e.target.value)}
                className={inputCls}
                style={inputStyle}
                required
              >
                {COMMERCIAL_TYPES.map((t) => (
                  <option key={t} value={t} style={{ background: "rgb(var(--bg))", color: "rgb(var(--fg))" }}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ── CONTACT & LOCATION ────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <div>
              <label className={labelCls} style={labelStyle}>Contact Number</label>
              <input
                type="tel"
                value={form.contactNo}
                onChange={(e) => updateField("contactNo", e.target.value)}
                className={inputCls}
                style={inputStyle}
                placeholder="+91 XXXXX XXXXX"
                required
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Project Location</label>
              <input
                type="text"
                value={form.projectLocation}
                onChange={(e) => updateField("projectLocation", e.target.value)}
                className={inputCls}
                style={inputStyle}
                placeholder="Full address"
                required
              />
            </div>
          </div>

          {/* ── BHK (residential only) ────────────────────────── */}
          {form.projectCategory === "residential" && (
            <div>
              <label className={labelCls} style={labelStyle}>BHK</label>
              <div className="flex gap-2 flex-wrap">
                {BHK_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => updateField("bhk", opt)}
                    className={cn(
                      "px-4 py-2 text-xs font-bold tracking-wider border transition-all duration-200",
                      form.bhk === opt
                        ? "border-[rgb(var(--fg))] shadow-sm"
                        : "border-[rgb(var(--border))] hover:border-[rgb(var(--fg-muted))]"
                    )}
                    style={{
                      color: form.bhk === opt ? "rgb(var(--fg))" : "rgb(var(--fg-muted))",
                      background: form.bhk === opt ? "rgba(var(--fg), 0.04)" : "transparent",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── AREA ──────────────────────────────────────────── */}
          <div>
            <label className={labelCls} style={labelStyle}>Area</label>
            <div className="flex items-end gap-3">
              <input
                type="number"
                value={form.areaValue}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.length <= 5) updateField("areaValue", val);
                }}
                max={99999}
                className={cn(inputCls, "flex-1")}
                style={inputStyle}
                placeholder="e.g. 1200"
                required
              />
              <div className="flex border" style={{ borderColor: "rgb(var(--border))" }}>
                {(["sqft", "sqmt"] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => updateField("areaUnit", unit)}
                    className={cn(
                      "px-3 py-2 text-[10px] uppercase tracking-widest font-bold transition-all duration-200",
                    )}
                    style={{
                      background: form.areaUnit === unit ? "rgb(var(--fg))" : "transparent",
                      color: form.areaUnit === unit ? "rgb(var(--bg))" : "rgb(var(--fg-muted))",
                    }}
                  >
                    {unit === "sqft" ? "Sq. Ft" : "Sq. Mt"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── FILE UPLOAD ───────────────────────────────────── */}
          <div>
            <label className={labelCls} style={labelStyle}>
              Plan Images / Documents
              <span className="font-normal ml-2 opacity-60">(PNG, JPEG, HEIC, PDF — max {MAX_FILES} files)</span>
            </label>

            {/* Drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200",
                isDragging ? "border-[rgb(var(--fg))] bg-[rgba(var(--fg),0.03)]" : "border-[rgb(var(--border))]",
              )}
            >
              <div className="text-2xl mb-2" style={{ color: "rgb(var(--fg-muted))" }}>📎</div>
              <p className="text-xs" style={{ color: "rgb(var(--fg-muted))" }}>
                {isDragging ? "Drop files here" : "Click or drag files here to upload"}
              </p>
              <p className="text-[10px] mt-1 opacity-50" style={{ color: "rgb(var(--fg-muted))" }}>
                Max {formatFileSize(MAX_FILE_SIZE)} per file
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_EXTENSIONS.join(",")}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />

            {/* File preview list */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 border"
                    style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--bg-surface))" }}
                  >
                    {/* Preview thumbnail */}
                    {f.preview ? (
                      <img src={f.preview} alt="" className="w-10 h-10 object-cover border flex-shrink-0" style={{ borderColor: "rgb(var(--border))" }} />
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center border text-lg flex-shrink-0" style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--fg-muted))" }}>
                        📄
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate" style={{ color: "rgb(var(--fg))" }}>{f.file.name}</p>
                      <p className="text-[10px]" style={{ color: "rgb(var(--fg-muted))" }}>{formatFileSize(f.file.size)}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-xs px-2 py-1 hover:opacity-70 transition-opacity flex-shrink-0"
                      style={{ color: "rgb(var(--fg-muted))" }}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── DESCRIPTION ───────────────────────────────────── */}
          <div>
            <label className={labelCls} style={labelStyle}>Brief Description</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={4}
              className="w-full p-4 text-sm focus:outline-none transition-colors resize-none border"
              style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--fg))", background: "transparent" }}
              placeholder="Tell us about your space, requirements, and vision..."
            />
          </div>

          {/* ── SUBMIT ────────────────────────────────────────── */}
          {submitSuccess && (
            <div className="p-4 text-center text-xs uppercase tracking-widest border" style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--accent, var(--fg)))" }}>
              ✅ Request submitted successfully!
            </div>
          )}
          <button
            disabled={isSubmitting}
            className="px-8 py-3 text-[10px] uppercase tracking-[0.2em] disabled:opacity-50 transition-colors w-full md:w-auto"
            style={{ background: "rgb(var(--fg))", color: "rgb(var(--bg))" }}
          >
            {isSubmitting ? "Uploading & Submitting..." : "Submit Request"}
          </button>
        </form>
      ) : (
        /* ============================================================ */
        /* REQUEST HISTORY                                               */
        /* ============================================================ */
        <div className="space-y-4">
          {loading ? (
            <p className="text-xs" style={{ color: "rgb(var(--fg-muted))" }}>Loading records...</p>
          ) : requests.length === 0 ? (
            <p className="text-xs italic" style={{ color: "rgb(var(--fg-muted))" }}>No past requests found.</p>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="p-6 transition-colors border"
                style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--bg-surface))" }}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Category badge + type */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className={cn(
                        "w-2 h-2 rounded-full flex-shrink-0",
                        req.status === "Completed" ? "bg-green-500" :
                          req.status === "In Progress" ? "bg-blue-500" :
                            req.status === "Rejected" ? "bg-red-500" : "bg-yellow-500"
                      )} />
                      <span
                        className="text-[10px] uppercase tracking-widest px-2 py-0.5 border font-bold"
                        style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--fg))" }}
                      >
                        {req.projectCategory === "commercial" ? "🏢 Commercial" : "🏠 Residential"}
                      </span>
                      {req.projectCategory === "commercial" && req.commercialType && (
                        <span className="text-[10px]" style={{ color: "rgb(var(--fg-muted))" }}>
                          {req.commercialType}
                        </span>
                      )}
                      {req.projectCategory === "residential" && req.bhk && (
                        <span className="text-[10px]" style={{ color: "rgb(var(--fg-muted))" }}>
                          {req.bhk} BHK
                        </span>
                      )}
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 mb-3">
                      {req.contactNo && (
                        <div>
                          <span className="block text-[9px] uppercase tracking-widest" style={{ color: "rgb(var(--fg-muted))" }}>Contact</span>
                          <span className="text-xs" style={{ color: "rgb(var(--fg))" }}>{req.contactNo}</span>
                        </div>
                      )}
                      {req.projectLocation && (
                        <div className="col-span-2 md:col-span-1">
                          <span className="block text-[9px] uppercase tracking-widest" style={{ color: "rgb(var(--fg-muted))" }}>Location</span>
                          <span className="text-xs" style={{ color: "rgb(var(--fg))" }}>{req.projectLocation}</span>
                        </div>
                      )}
                      {req.areaValue && (
                        <div>
                          <span className="block text-[9px] uppercase tracking-widest" style={{ color: "rgb(var(--fg-muted))" }}>Area</span>
                          <span className="text-xs" style={{ color: "rgb(var(--fg))" }}>
                            {req.areaValue} {req.areaUnit === "sqmt" ? "Sq. Mt" : "Sq. Ft"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {req.description && (
                      <p className="text-sm mb-3" style={{ color: "rgb(var(--fg-muted))" }}>{req.description}</p>
                    )}

                    {/* Plan images */}
                    {req.planImages && req.planImages.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {req.planImages.map((url: string, i: number) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                            className="w-12 h-12 border overflow-hidden block hover:opacity-80 transition-opacity"
                            style={{ borderColor: "rgb(var(--border))" }}
                          >
                            {url.endsWith(".pdf") ? (
                              <div className="w-full h-full flex items-center justify-center text-[10px]" style={{ color: "rgb(var(--fg-muted))" }}>PDF</div>
                            ) : (
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            )}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Admin notes */}
                    {req.adminNotes && req.adminNotes.trim() !== "" && (
                      <div className="text-[10px] p-3 border-l-2 mt-3" style={{ background: "rgba(var(--border), 0.3)", borderColor: "rgb(var(--border))", color: "rgb(var(--fg-muted))" }}>
                        <span className="font-bold">ADMIN NOTE:</span> {req.adminNotes}
                      </div>
                    )}
                  </div>

                  {/* Right — status + date */}
                  <div className="text-right flex-shrink-0">
                    <span className="block text-[10px] mb-1" style={{ color: "rgb(var(--fg-muted))" }}>{req.date}</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 border" style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--fg))" }}>
                      {req.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
