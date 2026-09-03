import { describe, expect, it } from "vitest";

import type { DetailOption } from "@shared/services/product";

import {
  formatOptionAxisValues,
  listProductOptionAxes,
  OPTION_AXIS_LABEL_KEY,
  OPTION_AXIS_ORDER,
} from "./optionAxes";

const value = (id: number, v: string) => ({ id, value: v });

describe("listProductOptionAxes", () => {
  it("option 이 없으면 빈 배열", () => {
    expect(listProductOptionAxes(undefined)).toEqual([]);
    expect(listProductOptionAxes({})).toEqual([]);
  });

  it("값이 빈 축은 제외한다", () => {
    const option: DetailOption = {
      COLOR: [value(1, "NAVY")],
      SIZE: [],
    };

    expect(listProductOptionAxes(option).map((axis) => axis.type)).toEqual([
      "COLOR",
    ]);
  });

  it("서버 키 순서와 무관하게 OPTION_AXIS_ORDER 순서로 돌려준다", () => {
    const option: DetailOption = {
      STYLE: [value(9, "CASUAL")],
      SIZE: [value(2, "M")],
      COLOR: [value(1, "NAVY")],
    };

    expect(listProductOptionAxes(option).map((axis) => axis.type)).toEqual([
      "COLOR",
      "SIZE",
      "STYLE",
    ]);
  });

  it("화장품 축(VOLUME, TEXTURE)을 인식한다", () => {
    const option: DetailOption = {
      TEXTURE: [value(4, "젤 크림")],
      VOLUME: [value(3, "50ml")],
    };

    expect(listProductOptionAxes(option)).toEqual([
      { type: "VOLUME", labelKey: "volume", values: [value(3, "50ml")] },
      { type: "TEXTURE", labelKey: "texture", values: [value(4, "젤 크림")] },
    ]);
  });

  it("모든 축에 라벨 키가 매핑되어 있다", () => {
    OPTION_AXIS_ORDER.forEach((type) => {
      expect(OPTION_AXIS_LABEL_KEY[type]).toBeTruthy();
    });
  });

  it("OPTION_AXIS_ORDER 에 중복이 없다", () => {
    expect(new Set(OPTION_AXIS_ORDER).size).toBe(OPTION_AXIS_ORDER.length);
  });
});

describe("formatOptionAxisValues", () => {
  it("값이 하나면 그대로", () => {
    expect(formatOptionAxisValues([value(1, "NAVY")])).toBe("NAVY");
  });

  it("값이 여러 개면 슬래시로 잇는다", () => {
    expect(
      formatOptionAxisValues([value(1, "S"), value(2, "M"), value(3, "L")]),
    ).toBe("S/M/L");
  });

  it("빈 배열은 빈 문자열", () => {
    expect(formatOptionAxisValues([])).toBe("");
  });
});
