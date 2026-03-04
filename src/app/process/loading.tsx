export default function Loading() {
    return (
        <div className="min-h-screen selection:bg-[#8a9a5b] pt-[120px] px-6 lg:px-12 max-w-[1600px] mx-auto" style={{ background: 'rgb(var(--bg-surface))', color: 'rgb(var(--fg))' }}>
            <div className="mb-24 md:mb-40">
                <div className="h-4 w-32 bg-[rgba(var(--fg),0.05)] rounded mb-6 animate-pulse" />
                <div className="h-16 md:h-24 w-full max-w-2xl bg-[rgba(var(--fg),0.05)] rounded mb-8 animate-pulse" />
                <div className="h-4 w-full max-w-3xl bg-[rgba(var(--fg),0.05)] rounded animate-pulse" />
            </div>

            <div className="space-y-32">
                {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
                        <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
                            <div className="h-32 w-full bg-[rgba(var(--fg),0.05)] rounded animate-pulse" />
                        </div>
                        <div className="lg:col-span-8 space-y-8">
                            <div className="h-64 md:h-96 w-full bg-[rgba(var(--fg),0.05)] rounded animate-pulse" />
                            <div className="space-y-4">
                                <div className="h-4 w-full bg-[rgba(var(--fg),0.05)] rounded animate-pulse" />
                                <div className="h-4 w-full bg-[rgba(var(--fg),0.05)] rounded animate-pulse" />
                                <div className="h-4 w-3/4 bg-[rgba(var(--fg),0.05)] rounded animate-pulse" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
