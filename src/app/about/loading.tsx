export default function Loading() {
    return (
        <div className="relative w-full overflow-hidden pb-24 pt-[100px]" style={{ background: 'rgb(var(--bg-surface))', color: 'rgb(var(--fg))' }}>
            {/* Hero Skeleton */}
            <section className="relative h-screen flex flex-col justify-end pb-24 px-6 md:px-12 border-b border-[rgba(var(--fg),0.1)]">
                <div className="max-w-7xl mx-auto w-full flex flex-col items-start z-10">
                    <div className="h-4 w-32 bg-[rgba(var(--fg),0.05)] rounded mb-6 animate-pulse" />
                    <div className="h-24 md:h-32 w-full max-w-5xl bg-[rgba(var(--fg),0.05)] rounded mb-8 animate-pulse" />
                    <div className="w-full md:w-1/2 ml-auto space-y-4">
                        <div className="h-6 w-full bg-[rgba(var(--fg),0.05)] rounded animate-pulse" />
                        <div className="h-6 w-5/6 bg-[rgba(var(--fg),0.05)] rounded animate-pulse" />
                    </div>
                </div>
            </section>

            {/* Founder Skeleton */}
            <section className="bg-[rgba(var(--bg),1)] py-32 border-b border-[rgba(var(--fg),0.1)]">
                <div className="max-w-[1600px] mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
                        <div className="lg:col-span-5 relative">
                            <div className="relative aspect-[3/4] overflow-hidden bg-[rgba(var(--fg),0.05)] animate-pulse shadow-2xl" />
                        </div>
                        <div className="lg:col-span-7 lg:pl-12 pt-8">
                            <div className="h-4 w-32 bg-[rgba(var(--fg),0.05)] rounded mb-6 animate-pulse" />
                            <div className="h-16 w-3/4 bg-[rgba(var(--fg),0.05)] rounded mb-4 animate-pulse" />
                            <div className="h-6 w-1/2 bg-[rgba(var(--fg),0.05)] rounded mb-12 animate-pulse" />
                            <div className="space-y-4 mb-16">
                                <div className="h-4 w-full bg-[rgba(var(--fg),0.05)] rounded animate-pulse" />
                                <div className="h-4 w-full bg-[rgba(var(--fg),0.05)] rounded animate-pulse" />
                                <div className="h-4 w-5/6 bg-[rgba(var(--fg),0.05)] rounded animate-pulse" />
                                <div className="h-4 w-3/4 bg-[rgba(var(--fg),0.05)] rounded animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
