import "@/global.css";

import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";

import { hydrateUserAuth } from "@shared/lib/auth/useUserAuthStore";
import { QueryProvider } from "@shared/lib/query/QueryProvider";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";

SplashScreen.preventAutoHideAsync();
// 첫 화면이 그려지는 동안 SecureStore 에서 토큰을 미리 복원해 둔다.
void hydrateUserAuth();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <QueryProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <AppTabs />
      </ThemeProvider>
    </QueryProvider>
  );
}
