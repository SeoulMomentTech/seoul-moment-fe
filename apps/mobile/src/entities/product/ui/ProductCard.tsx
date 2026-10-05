import { Image } from "expo-image";
import { Text, View } from "react-native";

import type { ProductItem } from "@shared/services/product";

interface ProductCardProps {
  product: ProductItem;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    // flex-1 은 flexBasis: 0 이라 늘어난 셀 안에서 카드 높이가 내용보다 작게 계산돼
    // aspectRatio 이미지가 넘쳐 아래 카드를 덮는다. 폭은 부모가 정하므로 w-full 만 쓴다.
    <View className="w-full">
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
