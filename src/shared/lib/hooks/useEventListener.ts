import { useEffect, type RefObject } from "react";

const useEventListener = <
  KW extends keyof WindowEventMap,
  KD extends keyof DocumentEventMap,
  KH extends keyof HTMLElementEventMap & keyof SVGElementEventMap,
>(
  eventName: KW | KD | KH,
  listener: (
    e:
      | WindowEventMap[KW]
      | DocumentEventMap[KD]
      | HTMLElementEventMap[KH]
      | SVGElementEventMap[KH]
      | Event,
  ) => void,
  meta: {
    options?: boolean | AddEventListenerOptions;
    element?: RefObject<HTMLElement | SVGElement | Document>;
  } = {},
) => {
  const { element, options } = meta;

  useEffect(() => {
    const targetElement = element?.current || window;

    targetElement.addEventListener(eventName, listener, options);

    return () => {
      targetElement.removeEventListener(eventName, listener, options);
    };
  }, [element, eventName, listener, options]);
};

export default useEventListener;
