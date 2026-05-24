import cityCountryData from "@shared/constants/json/cityCountryData.json";

import type { LanguageType } from "@/i18n/const";

interface RawArea {
  ZipCode: string;
  AreaName: string;
  AreaEngName: string;
}

interface RawCity {
  CityName: string;
  CityEngName: string;
  AreaList: RawArea[];
}

export interface RegionOption {
  value: string;
  label: string;
}

const cities = cityCountryData as RawCity[];

const pickCityLabel = (city: RawCity, locale: LanguageType) =>
  locale === "en" ? city.CityEngName : city.CityName;

const pickAreaLabel = (area: RawArea, locale: LanguageType) =>
  locale === "en" ? area.AreaEngName : area.AreaName;

export const getCityOptions = (locale: LanguageType): RegionOption[] =>
  cities.map((city) => ({
    value: city.CityName,
    label: pickCityLabel(city, locale),
  }));

export const getDistrictOptions = (
  cityValue: string | undefined,
  locale: LanguageType,
): RegionOption[] => {
  if (!cityValue) return [];
  const city = cities.find((c) => c.CityName === cityValue);
  if (!city) return [];
  return city.AreaList.map((area) => ({
    value: area.AreaName,
    label: pickAreaLabel(area, locale),
  }));
};
