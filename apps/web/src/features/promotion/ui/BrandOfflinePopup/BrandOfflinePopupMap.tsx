"use client";

interface BrandOfflinePopupMapProps {
  latitude: string;
  longitude: string;
}

export function BrandOfflinePopupMap({
  latitude,
  longitude,
}: BrandOfflinePopupMapProps) {
  return (
    <iframe
      className="w-full max-sm:h-[130px] max-sm:px-5"
      height="300"
      loading="lazy"
      src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`}
      title="location map"
      width="600"
    />
  );
}
