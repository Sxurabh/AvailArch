import { Metadata } from "next";
import ProcessContent from "@/components/process/ProcessContent";

export const metadata: Metadata = {
    title: "Process | Avail Arch",
    description: "Our architectural methodology and project execution phases.",
};

export default function ProcessPage() {
    return (
        <div className="min-h-screen selection:bg-[#8a9a5b]" style={{ background: 'rgb(var(--bg-surface))', color: 'rgb(var(--fg))' }}>
            <ProcessContent />
        </div>
    );
}
