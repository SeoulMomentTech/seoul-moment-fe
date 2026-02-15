"use client";

import { useCallback } from "react";

type DataLayerEvent = Record<string, unknown> & {
  event: string;
};

const useDataLayerPush = () => {
  return useCallback((payload: DataLayerEvent) => {
    const dataLayer = (
      window as Window & {
        dataLayer?: Array<Record<string, unknown>>;
      }
    ).dataLayer;

    if (!Array.isArray(dataLayer)) {
      return false;
    }

    dataLayer.push(payload);
    return true;
  }, []);
};

export default useDataLayerPush;
