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

/**
 * 縣市·區에 대응하는 우편번호. 주문서는 이 값으로 우편번호 칸을 자동 채운다 —
 * 대만 주소는 區가 정해지면 우편번호가 하나로 결정되므로 사용자가 외울 이유가 없다.
 */
export const findZipCode = (
  cityValue: string | undefined,
  districtValue: string | undefined,
): string | undefined => {
  if (!cityValue || !districtValue) return undefined;

  return cities
    .find((city) => city.CityName === cityValue)
    ?.AreaList.find((area) => area.AreaName === districtValue)?.ZipCode;
};
