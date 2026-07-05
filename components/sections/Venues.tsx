"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, CalendarPlus, Church, Clock, MapPin, Wine } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { FloralBranch, RingsOrnament } from "@/components/ui/Florals";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/lib/content";
import { EASE_OUT } from "@/lib/motion";
import { googleCalendarUrl, type CalendarEvent } from "@/lib/utils";

type Venue = {
  kind: string;
  name: string;
  address: string;
  city: string;
  time: string;
  image: string;
  imageAlt: string;
  mapsUrl: string;
  calendar: CalendarEvent;
};

function VenueCard({
  venue,
  icon,
  delay,
}: {
  venue: Venue;
  icon: ReactNode;
  delay: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 52 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1, ease: EASE_OUT, delay }}
      whileHover={{
        y: -7,
        transition: { type: "spring", stiffness: 280, damping: 22 },
      }}
      className="group relative flex flex-col overflow-hidden rounded-[28px] border border-ink/[0.07] bg-white/70 shadow-[0_30px_90px_-55px_rgba(27,27,27,0.5)] backdrop-blur-sm transition-shadow duration-700 hover:shadow-[0_44px_110px_-48px_rgba(169,138,88,0.5)]"
    >
      {/* Foto real del lugar */}
      <div className="relative h-52 w-full overflow-hidden md:h-60">
        <Image
          src={venue.image}
          alt={venue.imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 45vw"
          className="object-cover transition-transform duration-[1600ms] ease-out-expo group-hover:scale-[1.06]"
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/45 via-ink/5 to-transparent"
        />
        <span className="absolute bottom-4 left-5 text-[10px] font-medium uppercase tracking-[0.32em] text-cream/90">
          {venue.kind}
        </span>
      </div>

      <div className="relative p-8 md:p-10">
        <FloralBranch className="pointer-events-none absolute -right-6 top-2 h-32 rotate-[155deg] text-gold/[0.14] transition-transform duration-1000 ease-out-expo group-hover:rotate-[147deg] group-hover:scale-110" />

        <span className="grid size-12 place-items-center rounded-full border border-gold/40 text-gold-deep transition-colors duration-500 group-hover:border-gold group-hover:bg-gold/10">
          {icon}
        </span>

        <h3 className="mt-6 font-serif text-[1.7rem] font-light leading-tight text-ink">
          {venue.name}
        </h3>

        <div className="mt-5 space-y-2.5 text-[14px] leading-relaxed text-ink/60">
        <p className="flex items-center gap-2.5">
          <MapPin size={15} strokeWidth={1.75} className="shrink-0 text-gold-deep" />
          {venue.address} · {venue.city}
        </p>
        <p className="flex items-center gap-2.5">
          <Clock size={15} strokeWidth={1.75} className="shrink-0 text-gold-deep" />
          {venue.time}
        </p>
      </div>

      <div aria-hidden className="my-8 border-t border-dashed border-ink/15" />

      <div className="flex flex-wrap gap-3">
        <Button
          href={venue.mapsUrl}
          target="_blank"
          size="sm"
          magnetic={false}
          icon={<ArrowUpRight size={13} strokeWidth={2} />}
        >
          Cómo llegar
        </Button>
        <Button
          href={googleCalendarUrl(venue.calendar)}
          target="_blank"
          size="sm"
          variant="outline"
          magnetic={false}
          icon={<CalendarPlus size={13} strokeWidth={1.75} />}
        >
          Agendar
        </Button>
        </div>
      </div>
    </motion.article>
  );
}

export function Venues() {
  return (
    <section
      id="ceremonia"
      className="relative overflow-hidden bg-shell py-28 md:py-36"
    >
      <div
        aria-hidden
        className="animate-drift-slow absolute -left-40 top-1/3 size-[36rem] rounded-full bg-gold/[0.07] blur-3xl"
      />

      <div className="relative mx-auto max-w-5xl px-5 md:px-8">
        <SectionHeading
          eyebrow={site.venues.eyebrow}
          title={site.venues.title}
          description={site.venues.intro}
        />

        <div className="mt-10 flex justify-center">
          <RingsOrnament animate className="h-14 text-gold/80" />
        </div>

        <Reveal delay={0.15} y={18}>
          <p className="mt-6 text-center font-serif text-2xl font-light italic text-ink/75 md:text-3xl">
            {site.date.long}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:mt-20 md:grid-cols-2 md:gap-10">
          <VenueCard
            venue={site.venues.ceremony}
            icon={<Church size={20} strokeWidth={1.5} />}
            delay={0}
          />
          <VenueCard
            venue={site.venues.reception}
            icon={<Wine size={20} strokeWidth={1.5} />}
            delay={0.16}
          />
        </div>
      </div>
    </section>
  );
}
