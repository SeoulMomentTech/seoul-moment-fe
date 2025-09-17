import {
  Collaborators,
  Company,
  MainBanner,
  Mission,
  Vision,
} from "@/features/about";

export function AboutPage() {
  return (
    <>
      <MainBanner />
      <Company />
      <Vision />
      <Mission />
      <Collaborators />
    </>
  );
}
