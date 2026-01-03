export default function AboutPage() {
  return (
    <div className="max-w-2xl animate-in fade-in duration-500">
      <h1 className="text-3xl font-light mb-8">About Me</h1>
      <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          Hello, I am Mi Zhou. I am an architectural designer and researcher.
          My work explores the relationship between urban landscapes and human potential.
        </p>
        <p>
          With a focus on detailed mapping and narrative-driven design, I strive to
          uncover the hidden stories within our built environments. This portfolio
          is a collection of my journey through various scales of design, from
          intimate interior spaces to large-scale urban interventions.
        </p>
        <div className="pt-8">
          <p className="font-medium text-black">Contact</p>
          <a href="mailto:hello@example.com" className="hover:underline">hello@example.com</a>
        </div>
      </div>
    </div>
  );
}