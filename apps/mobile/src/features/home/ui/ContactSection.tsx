import { Text, View } from "react-native";

export function ContactSection() {
  return (
    <View className="bg-surface-soft mx-5 mt-12 rounded-xl px-5 py-8">
      <Text className="text-title-4 text-foreground font-bold">Contact Us</Text>
      <Text className="text-body-3 text-neutral mt-2">
        Looking to bring your brand to Taiwan? Talk to the Seoul Moment team.
      </Text>
    </View>
  );
}
