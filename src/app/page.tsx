"use client";
import FullyCustomExample from "@/components/HeroUnfold/DefaultExample";
import { NAV_ITEMS } from "@/components/FloatingNavbar/constants";
import { FloatingNavbar } from "@/components/FloatingNavbar/FloatingNavbar";
import FloatingTestimonials, {
  DEFAULT_DATA,
} from "@/components/FloatingTestimonials/FloatingTestimonials";
import Scrollytelling from "@/components/Scrollytelling";
import { useMemo } from "react";
import Calendar from "@/components/Calendar/Calendar";

export default function Home() {
  const demoItems = useMemo(
    () =>
      NAV_ITEMS.map((item: { label: any }) => ({
        ...item,
      })),
    [],
  );

  return (
    <main>
      <Scrollytelling />
      <FloatingTestimonials data={DEFAULT_DATA} />
      <FloatingNavbar items={demoItems} />
      <FullyCustomExample />
      <div style={{ marginTop: '50px' }}>
         <Calendar />
      </div>
    </main>
  );
}
