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
 * 채워진 하트. 목록의 줄 끝에서 "이미 고른 것"을 뜻한다.
 * 다른 아이콘과 달리 획이 아니라 면으로 그려서 "켜진 상태"로 읽힌다.
 * 빈 하트(HeartOutlineIcon)는 고를 수 있는 자리가 아니라 "아직 고른 것이 없다"는
 * 빈 화면에만 쓴다.
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

// 빈 화면 아이콘은 글자보다 크게 세운다. 본문 위에 놓이는 표제 역할이다.
export const EMPTY_ICON_SIZE = 32;

/** 아직 고른 것이 없는 관심 목록. 채워진 하트와 짝이 되도록 같은 윤곽을 획으로 그린다. */
export function HeartOutlineIcon({ size = DEFAULT_SIZE, color }: IconProps) {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={STROKE_WIDTH}
      />
    </Svg>
  );
}

/** 조건에 맞는 것이 없다. 찾는 행위가 비어 돌아왔다는 뜻이라 돋보기를 쓴다. */
export function SearchIcon({ size = DEFAULT_SIZE, color }: IconProps) {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={STROKE_WIDTH} />
      <Line
        stroke={color}
        strokeLinecap="round"
        strokeWidth={STROKE_WIDTH}
        x1={16.5}
        x2={21}
        y1={16.5}
        y2={21}
      />
    </Svg>
  );
}

/** 아직 본 것이 없다. 지나간 시간을 뜻하므로 시계를 쓴다. */
export function ClockIcon({ size = DEFAULT_SIZE, color }: IconProps) {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={STROKE_WIDTH} />
      <Path
        d="M12 7v5l3.5 2"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={STROKE_WIDTH}
      />
    </Svg>
  );
}

/** 아직 들어온 것이 없다. 무엇이 비었는지 특정할 수 없는 자리의 기본값이다. */
export function InboxIcon({ size = DEFAULT_SIZE, color }: IconProps) {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M3 13h5l1.5 2.5h5L16 13h5"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={STROKE_WIDTH}
      />
      <Path
        d="M5.5 4.5h13L21 13v5.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5V13z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={STROKE_WIDTH}
      />
    </Svg>
  );
}

/**
 * 장바구니. 헤더의 단추와 빈 장바구니 화면이 같이 쓴다 — 머리에서 누른 그림과 도착한
 * 화면의 그림이 같아야 "이 화면이 그 장바구니"임이 설명 없이 읽힌다.
 *
 * 바퀴만 면으로 그린다. 6pt 도 안 되는 원을 획으로 그리면 가운데가 메워져 점처럼 보이고,
 * 그 크기에서는 그냥 칠한 쪽이 또렷하다.
 */
export function CartIcon({ size = DEFAULT_SIZE, color }: IconProps) {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <Circle cx={9} cy={21} fill={color} r={1} />
      <Circle cx={20} cy={21} fill={color} r={1} />
      <Path
        d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={STROKE_WIDTH}
      />
    </Svg>
  );
}

/** 지우기·닫기. 장바구니에서 한 줄을 들어내는 단추가 쓴다. */
export function CloseIcon({ size = DEFAULT_SIZE, color }: IconProps) {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <Line
        stroke={color}
        strokeLinecap="round"
        strokeWidth={STROKE_WIDTH}
        x1={6}
        x2={18}
        y1={6}
        y2={18}
      />
      <Line
        stroke={color}
        strokeLinecap="round"
        strokeWidth={STROKE_WIDTH}
        x1={18}
        x2={6}
        y1={6}
        y2={18}
      />
    </Svg>
  );
}

/**
 * 내보내기. 웹이 쓰는 lucide Share2 와 같은 그림이다 — 점 셋을 선 둘이 잇는다.
 * iOS 의 사각형+화살표 대신 이 그림을 쓰는 것은 안드로이드에서도 같게 보이기 위해서다.
 */
export function ShareIcon({ size = DEFAULT_SIZE, color }: IconProps) {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <Circle cx={18} cy={5} r={3} stroke={color} strokeWidth={STROKE_WIDTH} />
      <Circle cx={6} cy={12} r={3} stroke={color} strokeWidth={STROKE_WIDTH} />
      <Circle cx={18} cy={19} r={3} stroke={color} strokeWidth={STROKE_WIDTH} />
      <Line
        stroke={color}
        strokeLinecap="round"
        strokeWidth={STROKE_WIDTH}
        x1={8.59}
        x2={15.42}
        y1={13.51}
        y2={17.49}
      />
      <Line
        stroke={color}
        strokeLinecap="round"
        strokeWidth={STROKE_WIDTH}
        x1={15.41}
        x2={8.59}
        y1={6.51}
        y2={10.49}
      />
    </Svg>
  );
}
