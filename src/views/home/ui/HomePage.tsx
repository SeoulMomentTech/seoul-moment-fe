import {
  SeasonCollection,
  IconNic,
  MainBanner,
  AboutUs,
  Journal,
} from "@/features/home";

export function HomePage() {
  return (
    <>
      <MainBanner />
      <div className="mx-auto max-w-[1500px]">
        <SeasonCollection />
        <AboutUs />
        <IconNic />
        <Journal />
      </div>
    </>
  );
}
