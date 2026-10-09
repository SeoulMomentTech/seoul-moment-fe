import cityCountryData from "@shared/constants/cityCountryData.json";
import type { LanguageType } from "@shared/lib/i18n/language";
import type { SelectOption } from "@shared/ui/select";

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

const cities = cityCountryData as RawCity[];

/**
 * 대만 縣市·區 목록. web 의 shared/lib/regions.ts 와 같은 데이터를 같은 규칙으로 읽는다.
 *
 * 저장하는 값은 언제나 중국어 이름(CityName / AreaName)이고 영어는 표시용일 뿐이다.
 * 앱이 영어 이름을 저장하면 web 의 선택 상자가 그 값을 못 찾아 주소 칸이 빈 채로 보인다 —
 * 같은 계정을 두 곳에서 여는 이상 저장 값은 한 벌이어야 한다.
 */
export const getCityOptions = (locale: LanguageType): SelectOption[] =>
  cities.map((city) => ({
    value: city.CityName,
    label: locale === "en" ? city.CityEngName : city.CityName,
  }));

/** 도시를 고르기 전에는 빈 목록이다 — 區는 縣市 아래에서만 뜻이 있다. */
export const getDistrictOptions = (
  cityValue: string | undefined,
  locale: LanguageType,
): SelectOption[] => {
  if (!cityValue) return [];

  const city = cities.find((c) => c.CityName === cityValue);
  if (!city) return [];

  return city.AreaList.map((area) => ({
    value: area.AreaName,
    label: locale === "en" ? area.AreaEngName : area.AreaName,
  }));
};
