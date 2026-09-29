import { View, type ViewProps } from "react-native";

import type { ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
};

export function ThemedView({
  style,
  // 아직 쓰지 않지만 View 로 흘려보내지 않도록 rest 에서 빼 둔다.
  lightColor: _lightColor,
  darkColor: _darkColor,
  type,
  ...otherProps
}: ThemedViewProps) {
  const theme = useTheme();

  return (
    <View
      style={[{ backgroundColor: theme[type ?? "background"] }, style]}
      {...otherProps}
    />
  );
}
