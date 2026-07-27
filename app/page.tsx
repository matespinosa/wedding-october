import { Closing } from "@/components/sections/Closing";
import { Countdown } from "@/components/sections/Countdown";
import { DressCode } from "@/components/sections/DressCode";
import { Footer } from "@/components/sections/Footer";
import { Gallery } from "@/components/sections/Gallery";
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
      <SectionDivider bg="bg-cream" fill="fill-ink" />
      <Gallery />
      <SectionDivider bg="bg-ink" fill="fill-shell" />
      <Venues />
      <SectionDivider bg="bg-shell" fill="fill-ink" />
      <DressCode />
      <Rsvp />
      <Closing />
      <Footer />
    </main>
  );
}
