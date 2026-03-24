import FloatingTestimonials from "@/components/FloatingTestimonials/FloatingTestimonials";
import Scrollytelling from "@/components/Scrollytelling";

export default function Home() {
  return (
    <main className="w-full bg-background">
      <Scrollytelling />
      <FloatingTestimonials />
    </main>
  );
}
