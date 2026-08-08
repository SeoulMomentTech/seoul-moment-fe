// swiper ships CSS-only subpath exports (`swiper/css`, `swiper/css/navigation`, ...)
// without type declarations. TypeScript 6 enables `noUncheckedSideEffectImports`
// by default, so these side-effect imports need ambient module declarations.
declare module "swiper/css";
declare module "swiper/css/*";
