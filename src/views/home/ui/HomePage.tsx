import {
  SeasonCollection,
  News,
  MainBanner,
  Article,
  ContactUS,
} from "@/features/home";

export function HomePage() {
  return (
    <>
      <MainBanner />
      <SeasonCollection />
      <div className="mx-auto w-[1280px] max-sm:w-auto">
        <News />
        <Article />
        <ContactUS />
      </div>
    </>
  );
}
