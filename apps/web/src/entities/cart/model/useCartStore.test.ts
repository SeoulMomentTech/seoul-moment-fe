import { beforeEach, describe, expect, it } from "vitest";

import type { CartLineDraft } from "./types";
import {
  MAX_CART_LINES,
  MAX_LINE_QUANTITY,
  useCartStore,
} from "./useCartStore";

const draft = (
  over: Partial<CartLineDraft> & Pick<CartLineDraft, "productId">,
): CartLineDraft => ({
  quantity: 1,
  productName: "코튼 트윌 오버셔츠",
  brandId: "b1",
  brandName: "온도",
  brandProfileImg: "",
  imageUrl: "",
  price: 1600,
  discountPrice: 1280,
  options: [{ type: "COLOR", optionValueId: 1, value: "NAVY" }],
  external: [],
  ...over,
});

const reset = () => useCartStore.setState({ lines: [], ownerId: 0 });

describe("useCartStore.addLines", () => {
  beforeEach(reset);

  it("담기 1회에 여러 조합이 각각 라인으로 들어간다", () => {
    const result = useCartStore.getState().addLines([
      draft({
        productId: 1,
        options: [{ type: "SIZE", optionValueId: 10, value: "M" }],
      }),
      draft({
        productId: 1,
        options: [{ type: "SIZE", optionValueId: 11, value: "S" }],
      }),
    ]);

    expect(result).toEqual({ status: "added", count: 2 });
    expect(useCartStore.getState().lines).toHaveLength(2);
  });

  it("같은 조합을 다시 담으면 새 라인이 아니라 수량 합산", () => {
    const { addLines } = useCartStore.getState();
    addLines([draft({ productId: 1, quantity: 2 })]);
    addLines([draft({ productId: 1, quantity: 3 })]);

    const { lines } = useCartStore.getState();
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(5);
  });

  it("옵션을 고른 순서가 달라도 같은 라인으로 합쳐진다", () => {
    const a = [
      { type: "COLOR" as const, optionValueId: 1, value: "NAVY" },
      { type: "SIZE" as const, optionValueId: 10, value: "M" },
    ];
    const { addLines } = useCartStore.getState();
    addLines([draft({ productId: 1, options: a })]);
    addLines([draft({ productId: 1, options: [...a].reverse() })]);

    expect(useCartStore.getState().lines).toHaveLength(1);
  });

  it("수량은 MAX_LINE_QUANTITY 를 넘지 않는다", () => {
    useCartStore
      .getState()
      .addLines([draft({ productId: 1, quantity: MAX_LINE_QUANTITY + 50 })]);

    expect(useCartStore.getState().lines[0].quantity).toBe(MAX_LINE_QUANTITY);
  });

  it("라인 상한을 넘으면 limit 을 반환하고 담지 않는다", () => {
    const many = Array.from({ length: MAX_CART_LINES }, (_, i) =>
      draft({
        productId: i + 1,
        options: [{ type: "SIZE", optionValueId: i + 1, value: `${i}` }],
      }),
    );
    useCartStore.getState().addLines(many);
    expect(useCartStore.getState().lines).toHaveLength(MAX_CART_LINES);

    const result = useCartStore
      .getState()
      .addLines([draft({ productId: 9999, options: [] })]);

    expect(result).toEqual({ status: "limit", max: MAX_CART_LINES });
    expect(useCartStore.getState().lines).toHaveLength(MAX_CART_LINES);
  });

  it("상한에 도달했어도 이미 있는 조합의 수량 합산은 허용한다", () => {
    const many = Array.from({ length: MAX_CART_LINES }, (_, i) =>
      draft({
        productId: i + 1,
        options: [{ type: "SIZE", optionValueId: i + 1, value: `${i}` }],
      }),
    );
    useCartStore.getState().addLines(many);

    const result = useCartStore.getState().addLines([many[0]]);

    expect(result).toEqual({ status: "added", count: 1 });
    expect(useCartStore.getState().lines[0].quantity).toBe(2);
  });

  it("빈 배열은 아무것도 하지 않는다", () => {
    expect(useCartStore.getState().addLines([])).toEqual({
      status: "added",
      count: 0,
    });
    expect(useCartStore.getState().lines).toHaveLength(0);
  });
});

describe("useCartStore 수량 / 삭제 / 되돌리기", () => {
  beforeEach(reset);

  it("updateQuantity 는 1 미만으로 내려가지 않는다", () => {
    useCartStore.getState().addLines([draft({ productId: 1 })]);
    const { lineId } = useCartStore.getState().lines[0];

    useCartStore.getState().updateQuantity(lineId, 0);
    expect(useCartStore.getState().lines[0].quantity).toBe(1);

    useCartStore.getState().updateQuantity(lineId, -5);
    expect(useCartStore.getState().lines[0].quantity).toBe(1);
  });

  it("removeLines 는 지정한 라인만 지운다", () => {
    const { addLines } = useCartStore.getState();
    addLines([
      draft({
        productId: 1,
        options: [{ type: "SIZE", optionValueId: 10, value: "M" }],
      }),
      draft({
        productId: 2,
        options: [{ type: "SIZE", optionValueId: 11, value: "S" }],
      }),
    ]);
    const [first] = useCartStore.getState().lines;

    useCartStore.getState().removeLines([first.lineId]);

    const { lines } = useCartStore.getState();
    expect(lines).toHaveLength(1);
    expect(lines[0].lineId).not.toBe(first.lineId);
  });

  it("restoreLines 로 삭제를 되돌린다", () => {
    useCartStore.getState().addLines([draft({ productId: 1, quantity: 3 })]);
    const [removed] = useCartStore.getState().lines;

    useCartStore.getState().removeLines([removed.lineId]);
    expect(useCartStore.getState().lines).toHaveLength(0);

    useCartStore.getState().restoreLines([removed]);
    const { lines } = useCartStore.getState();
    expect(lines).toHaveLength(1);
    expect(lines[0]).toEqual(removed);
  });

  it("restoreLines 는 이미 있는 라인을 중복 추가하지 않는다", () => {
    useCartStore.getState().addLines([draft({ productId: 1 })]);
    const [existing] = useCartStore.getState().lines;

    useCartStore.getState().restoreLines([existing]);

    expect(useCartStore.getState().lines).toHaveLength(1);
  });

  it("clear 는 전부 비운다", () => {
    useCartStore.getState().addLines([draft({ productId: 1 })]);
    useCartStore.getState().clear();

    expect(useCartStore.getState().lines).toHaveLength(0);
  });
});
