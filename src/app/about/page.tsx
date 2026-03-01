"use client";

import { useUser } from "@/hooks/useUser";
import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit2, Save, Plus, Trash2,
  Linkedin, Instagram, Mail, Quote,
  ChevronLeft, ChevronRight, Link as LinkIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---
interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
}

interface AboutData {
  heroTitle: string;
  heroSubtitle: string;
  stats: { label: string; value: string }[];
  founder: {
    name: string;
    role: string;
    images: string[]; // 🆕 Changed to array for slider
    quote: string;
    bio: string;
    signature: string;
    socials: {        // 🆕 Added editable socials
      linkedin: string;
      instagram: string;
      email: string;
    };
  };
  team: TeamMember[];
}

// --- Initial Default Data ---
const INITIAL_DATA: AboutData = {
  heroTitle: "Curating Spaces, Shaping Lifestyles.",
  heroSubtitle: "We believe that interior design is not merely about decorating a space, but about enhancing the way you live, work, and feel within it.",
  stats: [
    { label: "Years Experience", value: "12+" },
    { label: "Interiors Designed", value: "85+" },
    { label: "Design Awards", value: "14" },
  ],
  founder: {
    name: "Eleanor Vane",
    role: "Principal Interior Designer & Founder",
    images: [
      "https://images.unsplash.com/photo-1542314831-c6a4d14effd0?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1000" // Example 2nd image
    ],
    quote: "Exceptional interiors effortlessly blend form and function, creating environments that are as deeply personal as they are beautiful.",
    bio: "With over a decade of experience in high-end residential and boutique commercial design, Eleanor focuses on the intersection of modern minimalism and inviting warmth. Her layered, textural approach to interiors has been featured in Architectural Digest and Vogue Living. She believes every room should tell the client's story, and her mission is to help you translate your unique vision into a cohesive, breathable living space.",
    signature: "Eleanor V.",
    socials: {
      linkedin: "https://linkedin.com",
      instagram: "https://instagram.com",
      email: "mailto:hello@availarch.com"
    }
  },
  team: [
    {
      id: "1",
      name: "Sarah Jenkins",
      role: "Senior Interior Designer",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: "2",
      name: "David Chen",
      role: "Project Manager",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
    }
  ]
};

export default function AboutPage() {
  const { user } = useUser();
  const isAdmin = user?.role === "admin";

  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<AboutData>(INITIAL_DATA);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // --- Handlers ---
  const handleChange = (field: keyof AboutData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleStatChange = (index: number, field: "label" | "value", value: string) => {
    const newStats = [...data.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setData(prev => ({ ...prev, stats: newStats }));
  };

  // --- Founder Handlers ---
  const handleFounderChange = (field: keyof AboutData['founder'], value: any) => {
    setData(prev => ({ ...prev, founder: { ...prev.founder, [field]: value } }));
  };

  const handleSocialChange = (key: keyof AboutData['founder']['socials'], value: string) => {
    setData(prev => ({
      ...prev,
      founder: {
        ...prev.founder,
        socials: { ...prev.founder.socials, [key]: value }
      }
    }));
  };

  // Image Slider Logic
  const nextImage = () => {
    setCurrentImgIndex((prev) => (prev + 1) % data.founder.images.length);
  };
  const prevImage = () => {
    setCurrentImgIndex((prev) => (prev - 1 + data.founder.images.length) % data.founder.images.length);
  };

  const updateCurrentImageUrl = (url: string) => {
    const newImages = [...data.founder.images];
    newImages[currentImgIndex] = url;
    handleFounderChange("images", newImages);
  };

  const addImageSlide = () => {
    const newImages = [...data.founder.images, "https://via.placeholder.com/1000"];
    handleFounderChange("images", newImages);
    setCurrentImgIndex(newImages.length - 1); // Jump to new slide
  };

  const removeCurrentSlide = () => {
    if (data.founder.images.length <= 1) return;
    const newImages = data.founder.images.filter((_, i) => i !== currentImgIndex);
    handleFounderChange("images", newImages);
    setCurrentImgIndex(0);
  };

  // --- Team Handlers ---
  const addTeamMember = () => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: "New Member",
      role: "Role",
      image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=400"
    };
    setData(prev => ({ ...prev, team: [...prev.team, newMember] }));
  };

  const removeTeamMember = (id: string) => {
    setData(prev => ({ ...prev, team: prev.team.filter(t => t.id !== id) }));
  };

  const updateTeamMember = (id: string, field: keyof TeamMember, value: string) => {
    setData(prev => ({
      ...prev,
      team: prev.team.map(t => t.id === id ? { ...t, [field]: value } : t)
    }));
  };

  const saveChanges = async () => {
    setIsEditing(false);
    console.log("Saved Data:", data);
    // await fetch('/api/about', { method: 'POST', body: JSON.stringify(data) });
  };

  // --- Helper Components ---
  const EditableText = ({
    value,
    onChange,
    className,
    multiline = false,
    tag = "div"
  }: { value: string, onChange: (val: string) => void, className?: string, multiline?: boolean, tag?: string }) => {
    if (!isEditing) {
      if (tag === "h1") return <h1 className={className}>{value}</h1>;
      if (tag === "h2") return <h2 className={className}>{value}</h2>;
      if (tag === "h3") return <h3 className={className}>{value}</h3>;
      if (tag === "p") return <p className={className}>{value}</p>;
      return <div className={className}>{value}</div>;
    }

    return multiline ? (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        className={cn("w-full bg-gray-50 border border-gray-300 p-2 rounded-sm focus:ring-1 focus:ring-black outline-none resize-none", className)}
        rows={6}
      />
    ) : (
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        className={cn("w-full bg-gray-50 border border-gray-300 p-1 rounded-sm focus:ring-1 focus:ring-black outline-none", className)}
      />
    );
  };

  return (
    <div className="relative w-full overflow-hidden bg-black text-white pb-24 pt-[100px]">

      {/* --- Admin Toolbar --- */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50 flex gap-2">
          {isEditing ? (
            <button
              onClick={saveChanges}
              className="flex items-center gap-2 bg-[#bfff00] text-black px-6 py-3 rounded-full shadow-xl hover:scale-105 transition-transform uppercase tracking-widest text-xs font-bold"
            >
              <Save size={16} /> Save Changes
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-white text-black border border-gray-200 px-6 py-3 rounded-full shadow-xl hover:bg-gray-50 transition-colors uppercase tracking-widest text-xs font-bold"
            >
              <Edit2 size={16} /> Edit Page
            </button>
          )}
        </div>
      )}

      {/* --- HERO SECTION --- */}
      <section className="relative h-screen flex flex-col justify-end pb-24 px-6 md:px-12 border-b border-white/10">
        <div className="max-w-7xl mx-auto w-full flex flex-col items-start z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[#bfff00] text-xs uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
              <span className="w-8 h-[1px] bg-[#bfff00]"></span>
              About Us
            </p>
            <EditableText
              tag="h1"
              value={data.heroTitle}
              onChange={(v) => handleChange("heroTitle", v)}
              className="text-5xl md:text-8xl lg:text-[7rem] font-bold uppercase tracking-tighter leading-[0.9] mix-blend-difference mb-8 max-w-5xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="w-full md:w-1/2 ml-auto"
          >
            <EditableText
              tag="p"
              multiline
              value={data.heroSubtitle}
              onChange={(v) => handleChange("heroSubtitle", v)}
              className="text-xl md:text-2xl text-white/70 font-light leading-relaxed"
            />
          </motion.div>
        </div>

        {/* Ambient Video/Image Background */}
        <div className="absolute inset-0 z-0 opacity-20 mix-blend-luminosity">
          <Image
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2800&auto=format&fit=crop"
            alt="Studio Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {/* Stats Row */}
        <div className="max-w-7xl mx-auto w-full z-10 grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 border-t border-white/10 pt-8">
          {data.stats.map((stat, i) => (
            <div key={i}>
              <EditableText
                value={stat.value}
                onChange={(v) => handleStatChange(i, "value", v)}
                className="text-3xl lg:text-5xl font-bold tracking-tighter text-white block mb-1"
              />
              <EditableText
                value={stat.label}
                onChange={(v) => handleStatChange(i, "label", v)}
                className="text-[10px] uppercase tracking-[0.2em] text-[#bfff00] font-bold"
              />
            </div>
          ))}
        </div>
      </section>

      {/* --- FOUNDER SPOTLIGHT SECTION --- */}
      <section className="bg-[#0a0a0a] py-32 border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

            {/* Founder Image Slider (Left) */}
            <div className="lg:col-span-5 relative group mt-8 lg:mt-0">
              <div className="relative aspect-[3/4] overflow-hidden bg-white/5 shadow-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImgIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={data.founder.images[currentImgIndex]}
                      alt="Founder"
                      fill
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows (Transparent until hover) */}
                {data.founder.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-0 top-0 bottom-0 w-16 flex items-center justify-center bg-gradient-to-r from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 text-white hover:bg-black/40 z-20"
                    >
                      <ChevronLeft size={32} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-0 top-0 bottom-0 w-16 flex items-center justify-center bg-gradient-to-l from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 text-white hover:bg-black/40 z-20"
                    >
                      <ChevronRight size={32} />
                    </button>
                  </>
                )}

                {/* Admin Image Controls */}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2 p-6 transition-opacity opacity-0 group-hover:opacity-100 z-30">
                    <span className="text-[#bfff00] text-xs uppercase tracking-widest font-bold">Image URL ({currentImgIndex + 1}/{data.founder.images.length})</span>
                    <input
                      value={data.founder.images[currentImgIndex]}
                      onChange={(e) => updateCurrentImageUrl(e.target.value)}
                      className="w-full max-w-xs bg-black border border-white/20 text-white text-xs p-2 rounded-sm mb-2 focus:border-[#bfff00] outline-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={addImageSlide} className="px-3 py-1 bg-[#bfff00] text-black text-[10px] uppercase font-bold hover:bg-white">+ Add Slide</button>
                      {data.founder.images.length > 1 && (
                        <button onClick={removeCurrentSlide} className="px-3 py-1 bg-red-500 text-white text-[10px] uppercase font-bold hover:bg-red-600">Remove</button>
                      )}
                    </div>
                  </div>
                )}

                {/* Architectural Overlay Lines */}
                <div className="absolute inset-0 border border-white/20 z-10 pointer-events-none" />
              </div>

              {/* Decorative Border Offset */}
              <div className="absolute -bottom-6 -right-6 w-full h-full border border-white/10 z-[-1] hidden lg:block" />
            </div>

            {/* Founder Content (Right) */}
            <div className="lg:col-span-7 lg:pl-12 pt-8">
              <div className="mb-12">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#bfff00] font-bold mb-6 block">Meet The Principal</span>
                <EditableText
                  tag="h2"
                  value={data.founder.name}
                  onChange={(v) => handleFounderChange("name", v)}
                  className="text-5xl md:text-7xl font-bold uppercase tracking-tighter text-white mb-4"
                />
                <EditableText
                  value={data.founder.role}
                  onChange={(v) => handleFounderChange("role", v)}
                  className="text-sm md:text-base uppercase tracking-widest text-[#bfff00]"
                />
              </div>

              <div className="mb-12 relative">
                <Quote className="absolute -top-6 -left-8 text-white/5 w-16 h-16 -z-10" />
                <EditableText
                  tag="h3"
                  multiline
                  value={data.founder.quote}
                  onChange={(v) => handleFounderChange("quote", v)}
                  className="text-3xl md:text-4xl font-light italic text-white/90 leading-tight"
                />
              </div>

              <div className="prose prose-lg prose-invert max-w-none text-white/70 mb-16">
                <EditableText
                  multiline
                  tag="p"
                  value={data.founder.bio}
                  onChange={(v) => handleFounderChange("bio", v)}
                  className="text-lg leading-relaxed font-light"
                />
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-end justify-between border-t border-white/10 pt-12 gap-8">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#bfff00] block mb-4 font-bold">Signature</span>
                  <div className="font-handwriting text-4xl text-white opacity-80" style={{ fontFamily: 'cursive' }}>
                    <EditableText
                      value={data.founder.signature}
                      onChange={(v) => handleFounderChange("signature", v)}
                      className="text-4xl"
                    />
                  </div>
                </div>

                {/* Social Links (Dynamic) */}
                <div>
                  {isEditing ? (
                    <div className="flex flex-col gap-3 bg-white/5 border border-white/10 p-6 rounded-sm">
                      <span className="text-[10px] uppercase font-bold text-[#bfff00]">Social Links</span>
                      <div className="flex items-center gap-3">
                        <Linkedin size={16} className="text-white/50" />
                        <input
                          value={data.founder.socials.linkedin}
                          onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                          className="text-xs p-2 bg-black border border-white/20 text-white w-48 focus:border-[#bfff00] outline-none"
                          placeholder="LinkedIn URL"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Instagram size={16} className="text-white/50" />
                        <input
                          value={data.founder.socials.instagram}
                          onChange={(e) => handleSocialChange('instagram', e.target.value)}
                          className="text-xs p-2 bg-black border border-white/20 text-white w-48 focus:border-[#bfff00] outline-none"
                          placeholder="Instagram URL"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail size={16} className="text-white/50" />
                        <input
                          value={data.founder.socials.email}
                          onChange={(e) => handleSocialChange('email', e.target.value)}
                          className="text-xs p-2 bg-black border border-white/20 text-white w-48 focus:border-[#bfff00] outline-none"
                          placeholder="Email (mailto:...)"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      {data.founder.socials.linkedin && (
                        <a href={data.founder.socials.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-black hover:bg-[#bfff00] hover:border-[#bfff00] transition-all rounded-full group">
                          <Linkedin size={18} className="group-hover:scale-110 transition-transform" />
                        </a>
                      )}
                      {data.founder.socials.instagram && (
                        <a href={data.founder.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-black hover:bg-[#bfff00] hover:border-[#bfff00] transition-all rounded-full group">
                          <Instagram size={18} className="group-hover:scale-110 transition-transform" />
                        </a>
                      )}
                      {data.founder.socials.email && (
                        <a href={data.founder.socials.email} className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-black hover:bg-[#bfff00] hover:border-[#bfff00] transition-all rounded-full group">
                          <Mail size={18} className="group-hover:scale-110 transition-transform" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- TEAM SECTION (Conditionally Hidden) --- */}
      {(data.team.length > 0 || isEditing) && (
        <section className="px-6 md:px-12 max-w-[1600px] mx-auto pb-32">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <p className="text-[#bfff00] text-xs uppercase tracking-[0.3em] flex items-center gap-4 mb-4">
                <span className="w-8 h-[1px] bg-[#bfff00]"></span>
                The minds behind the designs
              </p>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none">Our Team</h2>
            </div>
            {isEditing && (
              <button
                onClick={addTeamMember}
                className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest bg-[#bfff00] text-black px-6 py-3 hover:bg-white transition-colors"
              >
                <Plus size={14} /> Add Member
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatePresence>
              {data.team.map((member) => (
                <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-500 flex flex-col"
                >
                  {/* Image Area */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-black">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 opacity-80 group-hover:opacity-100 scale-100 group-hover:scale-105"
                    />
                    {isEditing && (
                      <div className="absolute top-4 right-4 flex gap-2 z-20">
                        <button
                          onClick={() => removeTeamMember(member.id)}
                          className="bg-red-500 text-white p-2 hover:bg-red-600 shadow-md transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}

                    {/* Image Edit Overlay */}
                    {isEditing && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/90 p-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <span className="text-[9px] uppercase font-bold text-[#bfff00] block mb-2">Image URL</span>
                        <input
                          value={member.image}
                          onChange={(e) => updateTeamMember(member.id, "image", e.target.value)}
                          placeholder="Image URL"
                          className="w-full text-xs p-2 bg-black border border-white/20 text-white focus:border-[#bfff00] outline-none"
                        />
                      </div>
                    )}

                    {/* Architectural Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none" />
                  </div>

                  {/* Info Area */}
                  <div className="absolute bottom-0 left-0 w-full p-6 z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <EditableText
                      value={member.name}
                      onChange={(v) => updateTeamMember(member.id, "name", v)}
                      className="text-2xl font-bold uppercase tracking-tight text-white mb-1 block w-full"
                    />
                    <EditableText
                      value={member.role}
                      onChange={(v) => updateTeamMember(member.id, "role", v)}
                      className="text-[10px] uppercase tracking-[0.2em] text-[#bfff00] block w-full"
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {data.team.length === 0 && isEditing && (
              <div className="col-span-full py-24 text-center text-white/40 text-sm border border-dashed border-white/20 bg-white/5">
                <p className="mb-4">No team members added.</p>
                <p className="text-xs text-[#bfff00]">Click "Add Member" to show this section to visitors.</p>
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  );
}