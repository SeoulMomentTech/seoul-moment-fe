const styleMap = {
  section:
    "mx-auto w-[1280px] max-sm:w-full pt-[100px] max-sm:pt-[50px] text-center",
};

export function MagazineContents() {
  return (
    <section className={styleMap.section}>
      <h3 className="mb-[30px] text-center text-[24px] font-semibold max-sm:px-[20px] max-sm:text-[20px]">
        [1]
      </h3>
      <h3 className="mb-[40px] text-[24px] font-semibold max-sm:px-[20px] max-sm:text-[20px]">
        한국의 향과 미감을 바탕으로 지속 가능한 아름다움을 제안하는 프래그런스
        브랜드
      </h3>
      <p className="mb-[60px] leading-6! text-black/80 max-sm:px-[20px] max-sm:text-start">
        취 Chwi는 한국의 자연과 공간에서 영감을 받아, 그 곳에서 느껴지는 찰나의
        순간과 미감을 향으로 표현합니다. 수 많은 화려한 향기들 속에서 과연
        ‘우리다움’은 무엇일지 고민하고, 우리가 가장 편안하게 느끼는 향, 잊고
        있던 기억을 향으로 만들어갑니다. 우연히 만난 대나무숲길, 인센스향이
        조용히 피어오르는 고즈넉한 나무 사찰, 부드러운 해풍이 피어낸 쑥, 꽃이
        흐드러지게 피어난 푸른 들판, 곱게 갈린 먹이 포근한 종이를 만나는
        순간까지의 각 에피소드가 모두 가장 한국적이고 익숙한 ‘우리의 것’를
        섬세하게 향으로 표현합니다.눈을 감으면 더 선명해지는 기억, Chwi의 향을
        통해 다시 한번 떠올려보세요.
      </p>
      <div className="mb-[100px] h-[620px] bg-slate-300 max-sm:h-[200px]" />
      <div className="flex gap-[128px] max-sm:flex-col-reverse max-sm:gap-[40px]">
        <div className="max-sm:h- h-[600px] w-[522px] bg-slate-300 max-sm:mx-[20px] max-sm:h-[284px] max-sm:w-[264px]" />
        <div className="w-[630px] text-start max-sm:w-full max-sm:px-[20px]">
          <h3 className="mb-[60px] text-[24px] font-semibold max-sm:mb-[30px] max-sm:text-[20px]">
            Brand CEO Name
          </h3>
          <div className="flex flex-col gap-[30px] max-sm:gap-[20px]">
            <p className="text-[18px] font-semibold max-sm:text-[16px]">
              Chwi의 향은 부담스럽지 않고 은은한 자연의 향을 표현하기 위해 전문
              조향 기술을 사용합니다.
            </p>
            <p>
              “히어리 세라믹 작가 김은지라고 합니다.”라고 해요. 2016년부터
              히어리 세라믹을 통해 작업을 이어오는 동안 제 작업을 좋아해주시는
              분들도 늘었고 그만큼 자부심도 갖게 되어 어느덧 작가라 불리는 것이
              자연스러워졌습니다.
            </p>
            <p>
              도예를 전공한 대학 시절부터 유연한 형태를 좋아했어요. 졸업작품을
              준비하면서 틀에 잡히지 않는 모양을 많이 만들었죠. 이런 점을 남들과
              다른 특색으로 살리려 했어요. 유약 사용을 최소화 하며 흙의 질감을
              돋보이게 했고, 그릇이 그리는 선을 중요하게 생각해 최대한 얇게
              만들었어요. 색상도 옅게 나왔죠.
            </p>
            <p>
              이러한 과정에서 비로소 히어리 세라믹만의 캐릭터를 찾아낸 것
              같아요. 지금도 최대한 얇게 만들며 색다른 선을 보여주는 작업을
              이어가고 있습니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
