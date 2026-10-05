import { Image } from "expo-image";
import { Text, View } from "react-native";

interface PostRowProps {
  title: string;
  writer: string;
  createDate: string;
  imageUrl: string;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  // web(formatDateTime)과 같이 기기 로컬 시간 기준으로 맞춘다. UTC로 자르면 하루 어긋난다.
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
};

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
          className="text-body-3 text-foreground font-bold"
          numberOfLines={2}
        >
          {title}
        </Text>
        <Text className="text-body-3 text-neutral mt-1" numberOfLines={1}>
          {[writer, formatDate(createDate)].filter(Boolean).join(" · ")}
        </Text>
      </View>
    </View>
  );
}
