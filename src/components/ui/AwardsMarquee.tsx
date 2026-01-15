"use client";
import Marquee from "react-fast-marquee";

const awards = [
  "ARCHITECTURAL DIGEST",
  "•",
  "VOGUE LIVING",
  "•",
  "ELLE DECOR",
  "•",
  "DEZEEN AWARDS 2024",
  "•",
  "THE LOCAL PROJECT",
  "•",
  "DOMUS",
  "•",
  "HOUZZ BEST OF DESIGN",
  "•"
];

export default function AwardsMarquee() {
  return (
    <div className="w-full py-12 border-y border-gray-100 bg-gray-50/30">
      <Marquee gradient={false} speed={40} autoFill>
        {awards.map((award, i) => (
          <span 
            key={i} 
            className="text-2xl md:text-4xl font-light text-gray-300 uppercase tracking-widest mx-8 md:mx-16 select-none"
          >
            {award}
          </span>
        ))}
      </Marquee>
    </div>
  );
}