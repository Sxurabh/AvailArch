export default function Footer() {
  return (
    <footer className="py-12 px-6 md:px-12 border-t border-gray-100 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div className="text-xs text-muted uppercase tracking-wide">
          © 2019–2025 Mi Zhou. <br className="md:hidden"/> Images, drawings, and text by Mi Zhou.
        </div>
        <div className="text-lg font-bold tracking-widest uppercase">
          Mi Zhou
        </div>
      </div>
    </footer>
  );
}