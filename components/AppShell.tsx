"use client";

import { MotionConfig } from "framer-motion";
import { useState, type ReactNode } from "react";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { LoadContext } from "@/components/providers/load-context";
import { EnvelopeGate } from "@/components/sections/EnvelopeGate";
import { Navbar } from "@/components/layout/Navbar";
import { GrainOverlay } from "@/components/ui/GrainOverlay";

export function AppShell({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  return (
    <MotionConfig reducedMotion="user">
      <LenisProvider>
        <LoadContext.Provider value={ready}>
          <GrainOverlay />
          {/* Navbar y contenido viven dentro del sobre: es el sitio real
              el que sale de la carta, no una maqueta. */}
          <EnvelopeGate onOpen={() => setReady(true)}>
            <Navbar />
            {children}
          </EnvelopeGate>
        </LoadContext.Provider>
      </LenisProvider>
    </MotionConfig>
  );
}
