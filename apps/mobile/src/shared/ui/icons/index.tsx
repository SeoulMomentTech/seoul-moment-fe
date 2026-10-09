import Svg, { Circle, Line, Path } from "react-native-svg";

/**
 * 선 아이콘. 24 격자에 획 두께 2 로 그린다 — AppHeader 의 장바구니와 같은 규격이라
 * 한 화면에 섞여도 굵기가 어긋나지 않는다.
 *
 * SVG 는 className 을 받지 못해 색을 값으로 받는다. 호출부가 토큰 값을 넘긴다.
 */
interface IconProps {
  size?: number;
  color: string;
}

const STROKE_WIDTH = 2;
const DEFAULT_SIZE = 20;

/**
 * 채워진 하트. 이 앱에서 하트는 "이미 고른 것"에만 나오므로 빈 하트 변형을 두지 않는다 —
 * 관심 목록에 있는 줄은 모두 고른 것이고, 고르는 자리(상품 상세)는 아직 없다.
 * 다른 아이콘과 달리 획이 아니라 면으로 그려서, 줄 끝에서 "켜진 상태"로 읽힌다.
 */
export function HeartIcon({ size = DEFAULT_SIZE, color }: IconProps) {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        fill={color}
      />
    </Svg>
  );
}

/** 비밀번호 보기. 눌러서 가린 글자를 드러내는 상태를 뜻한다. */
export function EyeIcon({ size = DEFAULT_SIZE, color }: IconProps) {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={STROKE_WIDTH}
      />
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={STROKE_WIDTH} />
    </Svg>
  );
}

/** 비밀번호 숨기기. 눈 위에 사선을 그어 드러난 상태를 되돌린다는 뜻을 준다. */
export function EyeOffIcon({ size = DEFAULT_SIZE, color }: IconProps) {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={STROKE_WIDTH}
      />
      <Path
        d="M14.12 14.12a3 3 0 1 1-4.24-4.24"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={STROKE_WIDTH}
      />
      <Line
        stroke={color}
        strokeLinecap="round"
        strokeWidth={STROKE_WIDTH}
        x1={2}
        x2={22}
        y1={2}
        y2={22}
      />
    </Svg>
  );
}
