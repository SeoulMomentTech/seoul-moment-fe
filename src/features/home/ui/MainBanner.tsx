import Image from "next/image";

export function MainBanner() {
  return (
    <section className="h-[690px]">
      <Image
        alt=""
        className="h-full min-w-[400px] object-cover"
        height={727}
        src="https://images.unsplash.com/photo-1538329972958-465d6d2144ed?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3"
        width={4000}
      />
    </section>
  );
}
