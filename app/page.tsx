import { Closing } from "@/components/sections/Closing";
import { Countdown } from "@/components/sections/Countdown";
import { DressCode } from "@/components/sections/DressCode";
import { Footer } from "@/components/sections/Footer";
import { Gallery } from "@/components/sections/Gallery";
import { Gifts } from "@/components/sections/Gifts";
import { Hero } from "@/components/sections/Hero";
import { Rsvp } from "@/components/sections/Rsvp";
import { Story } from "@/components/sections/Story";
import { Venues } from "@/components/sections/Venues";
import { SectionDivider } from "@/components/ui/SectionDivider";

export default function Home() {
  return (
    <main>
      <Hero />
      <Countdown />
      <Story />
      {/* La galería pasa a ink, como el dress code, así que entra y sale
          con onda: cream (Historia en desktop, Countdown en móvil) → ink,
          y de ink al shell de Ceremonia. */}
      <SectionDivider bg="bg-cream" fill="fill-ink" />
      <Gallery />
      <SectionDivider bg="bg-ink" fill="fill-shell" />
      <Venues />
      <SectionDivider bg="bg-shell" fill="fill-ink" />
      <DressCode />
      {/* Un solo lienzo crema + atmósfera compartida: sin corte entre sobres y RSVP. */}
      <div className="relative overflow-hidden bg-cream">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="animate-drift absolute right-[-10%] top-[8%] size-[34rem] rounded-full bg-gold/[0.14] blur-3xl" />
          <div className="animate-drift-slow absolute bottom-[-8%] left-[-8%] size-[38rem] rounded-full bg-sand/60 blur-3xl" />
        </div>
        <div className="relative z-[1]">
          <Gifts />
          <Rsvp />
        </div>
      </div>
      <Closing />
      <Footer />
    </main>
  );
}
