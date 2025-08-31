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

      <div className="mx-auto w-[1280px] px-[20px] max-sm:w-auto max-sm:px-0">
        <SeasonCollection />
        <News />
        <Article />
        <ContactUS />
      </div>
    </>
  );
}
