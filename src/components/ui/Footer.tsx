export default function Footer() {
  return (
    <footer className="py-12 px-4 md:px-12 border-t border-gray-100 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-6 md:gap-4">
        <div className="text-xs text-muted uppercase tracking-wide leading-relaxed">
          © 2019–2025 Avail Arch. <br className="hidden md:block"/> Images, drawings, and text by Avail Arch.
        </div>
        <div className="text-lg font-bold tracking-widest uppercase self-start md:self-auto">
          Avail Arch
        </div>
      </div>
    </footer>
  );
}