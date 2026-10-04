import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HeroBanner } from "@features/home/ui/HeroBanner";
import { PromotionSection } from "@features/home/ui/PromotionSection";

export default function HomeScreen() {
  return (
    <SafeAreaView className="bg-background flex-1" edges={["top"]}>
      <ScrollView>
        <HeroBanner />
        <PromotionSection />
      </ScrollView>
    </SafeAreaView>
  );
}
