import "@/global.css";

import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { hydrateUserAuth } from "@shared/lib/auth/useUserAuthStore";
import { QueryProvider } from "@shared/lib/query/QueryProvider";

import { AnimatedSplashOverlay } from "@/components/animated-icon";

SplashScreen.preventAutoHideAsync();
// 첫 화면이 그려지는 동안 SecureStore 에서 토큰을 미리 복원해 둔다.
void hydrateUserAuth();

export default function RootLayout() {
  return (
    <QueryProvider>
      {/* 브랜드 토큰에 다크 값이 없어 라이트로 고정한다. app.json 의
          userInterfaceStyle 도 "light" 다. */}
      <ThemeProvider value={DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="news/[id]" />
          <Stack.Screen name="article/[id]" />
          <Stack.Screen name="product/[id]" />
        </Stack>
      </ThemeProvider>
    </QueryProvider>
  );
}
