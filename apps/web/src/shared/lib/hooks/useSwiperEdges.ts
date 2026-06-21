import { useState } from "react";

import type { SwiperClass } from "swiper/react";

/**
 * Swiper의 시작/끝 도달 상태를 React state로 동기화한다.
 * onEdge를 Swiper의 onSwiper/onSlideChange/onProgress/onResize에 연결해 사용한다.
 */
const useSwiperEdges = () => {
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const onEdge = (swiper: SwiperClass) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  return { isBeginning, isEnd, onEdge };
};

export default useSwiperEdges;
