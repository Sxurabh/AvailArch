import { Metadata } from "next";
import ProcessContent from "@/components/process/ProcessContent";

export const metadata: Metadata = {
    title: "Process | Avail Arch",
    description: "Our architectural methodology and project execution phases.",
};

export default function ProcessPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#bfff00] selection:text-black">
            <ProcessContent />
        </div>
    );
}
