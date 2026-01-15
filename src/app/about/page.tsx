"use client";

import { useSession } from "next-auth/react";
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
  heroTitle: "Crafting Spaces, Defining Lifestyles.",
  heroSubtitle: "We believe that architecture is not just about walls, but about the life that happens between them.",
  stats: [
    { label: "Years Experience", value: "12+" },
    { label: "Projects Completed", value: "85+" },
    { label: "Design Awards", value: "14" },
  ],
  founder: {
    name: "Eleanor Vane",
    role: "Principal Architect & Founder",
    images: [
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000" // Example 2nd image
    ],
    quote: "Design is not just what it looks like and feels like. Design is how it works.",
    bio: "With over a decade of experience in high-end residential and commercial design, Eleanor focuses on the intersection of minimalism and warmth. Her work has been featured in Architectural Digest and Vogue Living. She believes every space tells a story, and her mission is to help you write yours.",
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
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";
  
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
    <div className="min-h-screen bg-white pb-24">
      
      {/* --- Admin Toolbar --- */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50 flex gap-2">
          {isEditing ? (
            <button 
              onClick={saveChanges}
              className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full shadow-xl hover:scale-105 transition-transform uppercase tracking-widest text-xs font-bold"
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
      <section className="relative pt-32 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="max-w-4xl">
          <EditableText 
            tag="h1"
            value={data.heroTitle} 
            onChange={(v) => handleChange("heroTitle", v)}
            className="text-4xl md:text-7xl font-light tracking-tight text-black mb-6 leading-[1.1]"
          />
          <EditableText 
            tag="p"
            multiline
            value={data.heroSubtitle} 
            onChange={(v) => handleChange("heroSubtitle", v)}
            className="text-lg md:text-xl text-gray-500 font-light max-w-2xl leading-relaxed"
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 border-t border-gray-100 pt-8">
          {data.stats.map((stat, i) => (
            <div key={i}>
              <EditableText 
                value={stat.value} 
                onChange={(v) => handleStatChange(i, "value", v)}
                className="text-3xl font-light text-black block mb-1"
              />
              <EditableText 
                value={stat.label} 
                onChange={(v) => handleStatChange(i, "label", v)}
                className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold"
              />
            </div>
          ))}
        </div>
      </section>

      {/* --- FOUNDER SPOTLIGHT SECTION --- */}
      <section className="bg-stone-50 py-24 mb-24">
         <div className="max-w-[1600px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Founder Image Slider (Left) */}
              <div className="lg:col-span-5 relative group">
                 <div className="relative aspect-[3/4] overflow-hidden bg-gray-200 shadow-2xl">
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
                           className="object-cover"
                         />
                      </motion.div>
                    </AnimatePresence>

                    {/* Navigation Arrows (Transparent until hover) */}
                    {data.founder.images.length > 1 && (
                      <>
                        <button 
                          onClick={prevImage}
                          className="absolute left-0 top-0 bottom-0 w-16 flex items-center justify-center bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 text-white hover:bg-black/10"
                        >
                          <ChevronLeft size={32} />
                        </button>
                        <button 
                          onClick={nextImage}
                          className="absolute right-0 top-0 bottom-0 w-16 flex items-center justify-center bg-gradient-to-l from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 text-white hover:bg-black/10"
                        >
                          <ChevronRight size={32} />
                        </button>
                      </>
                    )}

                    {/* Admin Image Controls */}
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 p-6 transition-opacity opacity-0 group-hover:opacity-100">
                        <span className="text-white text-xs uppercase tracking-widest font-bold">Image URL ({currentImgIndex + 1}/{data.founder.images.length})</span>
                        <input 
                          value={data.founder.images[currentImgIndex]}
                          onChange={(e) => updateCurrentImageUrl(e.target.value)}
                          className="w-full max-w-xs bg-white/90 text-black text-xs p-2 rounded-sm mb-2"
                        />
                        <div className="flex gap-2">
                           <button onClick={addImageSlide} className="px-3 py-1 bg-white text-black text-[10px] uppercase font-bold hover:bg-gray-200">+ Add Slide</button>
                           {data.founder.images.length > 1 && (
                             <button onClick={removeCurrentSlide} className="px-3 py-1 bg-red-500 text-white text-[10px] uppercase font-bold hover:bg-red-600">Remove</button>
                           )}
                        </div>
                      </div>
                    )}
                 </div>
                 {/* Decorative Border Offset */}
                 <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-black/5 z-[-1] hidden lg:block" />
              </div>

              {/* Founder Content (Right) */}
              <div className="lg:col-span-7 lg:pl-12 pt-8">
                 <div className="mb-8">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold mb-4 block">Meet The Principal</span>
                    <EditableText 
                      tag="h2"
                      value={data.founder.name} 
                      onChange={(v) => handleFounderChange("name", v)}
                      className="text-4xl md:text-5xl font-serif text-black mb-2"
                    />
                    <EditableText 
                      value={data.founder.role} 
                      onChange={(v) => handleFounderChange("role", v)}
                      className="text-sm uppercase tracking-widest text-gray-500 font-medium"
                    />
                 </div>

                 <div className="mb-10 relative">
                    <Quote className="absolute -top-6 -left-8 text-gray-200 w-12 h-12 -z-10" />
                    <EditableText 
                      tag="h3"
                      multiline
                      value={data.founder.quote} 
                      onChange={(v) => handleFounderChange("quote", v)}
                      className="text-2xl font-light italic text-gray-800 leading-relaxed"
                    />
                 </div>

                 <div className="prose prose-sm max-w-none text-gray-600 mb-10">
                    <EditableText 
                      multiline
                      tag="p"
                      value={data.founder.bio} 
                      onChange={(v) => handleFounderChange("bio", v)}
                      className="text-base leading-7 font-light"
                    />
                 </div>

                 <div className="flex items-end justify-between border-t border-gray-200 pt-8">
                    <div>
                        <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-2">Signature</span>
                        <div className="font-handwriting text-3xl text-black" style={{ fontFamily: 'cursive' }}>
                           <EditableText 
                             value={data.founder.signature} 
                             onChange={(v) => handleFounderChange("signature", v)}
                             className="text-3xl"
                           />
                        </div>
                    </div>
                    
                    {/* Social Links (Dynamic) */}
                    <div>
                      {isEditing ? (
                        <div className="flex flex-col gap-2 bg-gray-100 p-4 rounded-sm">
                           <span className="text-[9px] uppercase font-bold text-gray-400">Social Links</span>
                           <div className="flex items-center gap-2">
                             <Linkedin size={14} className="text-gray-400" />
                             <input 
                               value={data.founder.socials.linkedin}
                               onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                               className="text-xs p-1 bg-white border border-gray-300 w-40"
                               placeholder="LinkedIn URL"
                             />
                           </div>
                           <div className="flex items-center gap-2">
                             <Instagram size={14} className="text-gray-400" />
                             <input 
                               value={data.founder.socials.instagram}
                               onChange={(e) => handleSocialChange('instagram', e.target.value)}
                               className="text-xs p-1 bg-white border border-gray-300 w-40"
                               placeholder="Instagram URL"
                             />
                           </div>
                           <div className="flex items-center gap-2">
                             <Mail size={14} className="text-gray-400" />
                             <input 
                               value={data.founder.socials.email}
                               onChange={(e) => handleSocialChange('email', e.target.value)}
                               className="text-xs p-1 bg-white border border-gray-300 w-40"
                               placeholder="Email (mailto:...)"
                             />
                           </div>
                        </div>
                      ) : (
                        <div className="flex gap-4">
                            {data.founder.socials.linkedin && (
                              <a href={data.founder.socials.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-all rounded-full">
                                <Linkedin size={14} />
                              </a>
                            )}
                            {data.founder.socials.instagram && (
                              <a href={data.founder.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-all rounded-full">
                                <Instagram size={14} />
                              </a>
                            )}
                            {data.founder.socials.email && (
                              <a href={data.founder.socials.email} className="w-10 h-10 bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-all rounded-full">
                                <Mail size={14} />
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
        <section className="px-6 md:px-12 max-w-[1600px] mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-2xl font-light uppercase tracking-[0.2em] text-black mb-2">Our Team</h2>
              <p className="text-xs text-gray-400 uppercase tracking-widest">The minds behind the designs</p>
            </div>
            {isEditing && (
              <button 
                onClick={addTeamMember}
                className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors"
              >
                <Plus size={12} /> Add Member
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {data.team.map((member) => (
                <motion.div 
                  key={member.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative bg-white border border-gray-100 hover:border-gray-300 transition-colors duration-300 flex flex-col"
                >
                  {/* Image Area */}
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <Image 
                      src={member.image} 
                      alt={member.name} 
                      fill 
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                    {isEditing && (
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button 
                          onClick={() => removeTeamMember(member.id)}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-md"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                    
                    {/* Image Edit Overlay */}
                    {isEditing && (
                      <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        <input 
                          value={member.image}
                          onChange={(e) => updateTeamMember(member.id, "image", e.target.value)}
                          placeholder="Image URL"
                          className="w-full text-[10px] p-1 bg-transparent border-b border-gray-300 focus:border-black outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Info Area */}
                  <div className="p-6">
                    <EditableText 
                      value={member.name}
                      onChange={(v) => updateTeamMember(member.id, "name", v)}
                      className="text-lg font-medium text-black mb-1 block w-full"
                    />
                    <EditableText 
                      value={member.role}
                      onChange={(v) => updateTeamMember(member.id, "role", v)}
                      className="text-[10px] uppercase tracking-widest text-gray-400 block w-full"
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {data.team.length === 0 && isEditing && (
              <div className="col-span-full py-12 text-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                <p className="mb-4">No team members added.</p>
                <p className="text-xs">Click "Add Member" to show this section to visitors.</p>
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  );
}