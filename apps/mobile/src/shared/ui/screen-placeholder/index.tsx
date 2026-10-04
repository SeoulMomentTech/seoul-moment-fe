import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenPlaceholderProps {
  title: string;
}

/**
 * 아직 구현되지 않은 탭 화면. 탭 전환이 동작하는지 확인하는 용도다.
 */
export function ScreenPlaceholder({ title }: ScreenPlaceholderProps) {
  return (
    <SafeAreaView className="bg-background flex-1">
      <View className="flex-1 items-center justify-center">
        <Text className="text-title-3 text-foreground font-bold">{title}</Text>
        <Text className="text-body-3 text-neutral mt-2">Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}
