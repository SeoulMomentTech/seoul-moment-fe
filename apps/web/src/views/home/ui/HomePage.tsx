import PrimeSection from "@/features/home/ui/PrimeSection";

import { News, Article, ContactUS } from "@features/home";

export function HomePage() {
  return (
    <>
      <PrimeSection />
      <div className="mx-auto w-[1280px] px-[20px] max-sm:w-auto max-sm:px-0">
        <News />
        <Article />
        <ContactUS />
      </div>
    </>
  );
}
