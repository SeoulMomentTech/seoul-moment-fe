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
      <div className="mx-auto">
        <SeasonCollection />
        <News />
        <Article />
        <ContactUS />
      </div>
    </>
  );
}
