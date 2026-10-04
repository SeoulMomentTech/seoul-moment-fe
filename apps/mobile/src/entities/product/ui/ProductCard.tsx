import { Image } from "expo-image";
import { Text, View } from "react-native";

import type { ProductItem } from "@shared/services/product";

interface ProductCardProps {
  product: ProductItem;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <View className="flex-1">
      <Image
        contentFit="cover"
        source={product.image}
        // 이미지가 404 이거나 느려도 자리 높이가 유지되도록 비율을 고정한다.
        style={{ width: "100%", aspectRatio: 1, borderRadius: 8 }}
        transition={200}
      />
      <Text className="text-body-3 text-neutral mt-2" numberOfLines={1}>
        {product.brandName}
      </Text>
      <Text className="text-body-3 text-foreground" numberOfLines={2}>
        {product.productName}
      </Text>
      <Text className="text-body-3 text-foreground mt-1 font-bold">
        {`NT$${product.price.toLocaleString("en-US")}`}
      </Text>
    </View>
  );
}
