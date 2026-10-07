import { Image } from "expo-image";
import { Text, View } from "react-native";

import { formatDate } from "@shared/lib/utils/formatDate";

interface PostRowProps {
  title: string;
  writer: string;
  createDate: string;
  imageUrl: string;
}

export function PostRow({ title, writer, createDate, imageUrl }: PostRowProps) {
  return (
    <View className="flex-row items-center gap-3 px-5 py-3">
      <Image
        contentFit="cover"
        source={imageUrl}
        style={{ width: 88, height: 72, borderRadius: 8 }}
        transition={200}
      />
      <View className="flex-1">
        <Text
          className="text-body-2 text-foreground font-bold"
          numberOfLines={2}
        >
          {title}
        </Text>
        <Text className="text-body-5 text-neutral mt-1" numberOfLines={1}>
          {[writer, formatDate(createDate)].filter(Boolean).join(" · ")}
        </Text>
      </View>
    </View>
  );
}
