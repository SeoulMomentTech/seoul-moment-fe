import Image from "next/image";
import { cn } from "@/shared/lib/style";
import { BrandProducts } from "@/widgets/brand-products";

export default function BrandDetail() {
  return (
    <>
      <section
        className={cn(
          "mx-auto h-[856px] max-w-[1928px] min-w-[1280px] pt-[56px] max-sm:h-[456px]",
          "max-sm:max-w-none max-sm:min-w-auto",
        )}
      >
        <Image
          alt=""
          className="h-full object-cover"
          height={800}
          src="https://images.unsplash.com/photo-1538329972958-465d6d2144ed?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3"
          width={4000}
        />
      </section>
      <article
        className={cn(
          "mx-auto w-[1280px] pt-[100px]",
          "max-sm:w-full max-sm:pt-[90px]",
        )}
      >
        <div
          className={cn(
            "flex gap-[128px] pb-[100px]",
            "max-sm:flex-col max-sm:gap-[40px] max-sm:pb-[90px]",
          )}
        >
          <div
            className={cn(
              "flex min-w-[522px] flex-col gap-[30px] font-semibold",
              "max-sm:min-w-full max-sm:gap-[20px] max-sm:px-[20px]",
            )}
          >
            <h2 className="text-title-2 max-sm:text-title-4">
              요컨대 머들을 쌓는 마음과 같았습니다.
            </h2>
            <p className="text-title-3 max-sm:text-title-4">
              선택하신 분들의 일상에 아름다움을 더하고 실용적으로 가능하길
              바라며 새로움을 준비했습니다.
            </p>
          </div>
          <div
            className={cn(
              "flex flex-col gap-[60px]",
              "max-sm:flex-col-reverse max-sm:gap-[40px] max-sm:px-[20px]",
            )}
          >
            <div
              className={cn("flex flex-col gap-[30px]", "max-sm:gap-[20px]")}
            >
              <h4
                className={cn(
                  "text-body-1 font-semibold",
                  "max-sm:text-body-2",
                )}
              >
                머들을 쌓아 올리는 마음으로, 머들 디퓨저
              </h4>
              <p>
                머들디퓨저의 새로움은 향기에 한하지 않습니다. 직접 사용해보시고
                선물로 선택해 주신 많은 분들의 진심어린 의견을 확인하며 새롭게
                선보일 것들을 준비했어요. 좀 더 오랫동안 향을 즐기고 싶거나 다른
                향을 경험해보고 싶은 분들을 위해 다섯 가지 향기의 리필액을
                선보입니다. 또한 머들의 디자인을 완성해주는우 드볼 스틱도 별도로
                구입하실 수 있게 했고요. 다섯 가지 향기를 모두 경험해보고 싶다면
                미니어처 석고방향제 형태의 디스커버리키트를 권해드립니다. 또
                하나, 많은 분들이 소중한 사람을 위한 선물로 머들디퓨저를
                선택했다는 사실에 주목했습니다. 좋은 선물로 건넬 수 있고
                받아보실 분들께서 만족하실 수 있도록 구성품을 재정비했어요.
                선물을 건네는 그 순간까지도 모자람이 없도록 선물 포장용
                쇼핑백까지 부족함 없도록 준비했고요. 머들을 쌓아 올리는
                마음으로, 새로운 이구어퍼스트로피 머들디 퓨저를 만나보실 분들
                모두가 더욱 만족하시길 바랍니다.
              </p>
            </div>
            <div
              className={cn(
                "flex gap-[20px]",
                "max-sm:flex-col max-sm:gap-[40px]",
              )}
            >
              <div className="flex max-sm:justify-start">
                <div
                  className={cn(
                    "h-[500px] w-[305px] bg-slate-300",
                    "max-sm:h-[320px] max-sm:w-[208px]",
                  )}
                />
              </div>
              <div className="flex max-sm:justify-end">
                <div
                  className={cn(
                    "h-[500px] w-[305px] bg-slate-300",
                    "max-sm:h-[320px] max-sm:w-[208px]",
                  )}
                />
              </div>
            </div>
          </div>
        </div>
        <div
          className={cn(
            "flex gap-[65px] pb-[140px]",
            "max-sm:flex-col max-sm:gap-[40px] max-sm:px-[20px] max-sm:pb-[90px]",
          )}
        >
          <div
            className={cn(
              "h-[640px] min-w-[585px] bg-slate-300",
              "max-sm:h-[400px] max-sm:min-w-full",
            )}
          />
          <div className="flex flex-col justify-end gap-[20px]">
            <h4
              className={cn("text-body-1 font-semibold", "max-sm:text-body-2")}
            >
              소비자 입장에서 본다면 어떨까요? 이구어퍼스트로피가 추구하고 있는
              ‘아름다운 실용’과 잘 어울릴까요?
            </h4>
            <p>
              오브제 자체의 형태감이 아름다움을 지니고 있다고 생각해요. 향기를
              통해 힐링할 수 있으니 일상에서 충분히 효용감을 갖는 실용성도
              겸비하고 있다고 봅니다. 적어도 저에게는 실용적인 아이템이에요.
              그만큼 매력을 느낀다면 소중한 누군가에게 권하기도 좋을 것 같아요.
              만약 선물한다면 어떤 사람에게 선물하고 싶나요? 최근 새로 이사를 한
              친구가 있어요. 원래도 인테리어에 안목이 있는 친구이지만 새로운
              공간은 더 근사하더라고요. 특히 새로운 집에 옅은 블루 컬러의 커튼이
              있는데, 초여름의 무화과와 잘 어울릴 것 같았어요. 그 친구의 취향도
              만족시켜줄 수 있을 것 같고요.
            </p>
          </div>
        </div>
      </article>
      <section
        className={cn(
          "mx-auto h-[800px] min-h-[800px] max-w-[1928px] min-w-[1280px]",
          "max-sm:h-[240px] max-sm:min-h-[240px] max-sm:max-w-none max-sm:min-w-auto",
        )}
      >
        <Image
          alt=""
          className="h-full object-cover"
          height={800}
          src="https://images.unsplash.com/photo-1538329972958-465d6d2144ed?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3"
          width={4000}
        />
      </section>
      <article
        className={cn(
          "mx-auto flex w-[1280px] flex-col gap-[60px] pt-[140px] pb-[100px]",
          "max-sm:w-full max-sm:gap-[40px] max-sm:px-[20px] max-sm:pt-[90px] max-sm:pb-[50px]",
        )}
      >
        <h4 className={cn("text-title-3 font-semibold", "max-sm:text-title-4")}>
          선택하신 분들의 일상에 아름다움을 더하고 실용적으로 가능하길 바라며
          새로움을 준비했습니다.
        </h4>
        <div className="flex items-center justify-center">
          <figure
            className={cn(
              "h-[600px] w-[846px]",
              "max-sm:h-[244px] max-sm:w-full",
            )}
          >
            <Image
              alt=""
              className="h-full object-cover"
              height={600}
              src="https://images.unsplash.com/photo-1538329972958-465d6d2144ed?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3"
              width={900}
            />
          </figure>
        </div>
        <p>
          오브제 자체의 형태감이 아름다움을 지니고 있다고 생각해요. 향기를 통해
          힐링할 수 있으니 일상에서 충분히 효용감을 갖는 실용성도 겸비하고
          있다고 봅니다.{" "}
        </p>
      </article>
      <BrandProducts id={1} />
    </>
  );
}
