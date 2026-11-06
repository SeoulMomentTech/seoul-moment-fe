import type { CvsChain } from "@shared/services/logistics";

/** 체인 표시명. 브랜드명이라 번역하지 않는다 */
export const CVS_CHAINS: ReadonlyArray<{ chain: CvsChain; label: string }> = [
  { chain: "UNIMART", label: "7-ELEVEN" },
  { chain: "FAMI", label: "全家" },
  { chain: "HILIFE", label: "萊爾富" },
];

export const getCvsChainLabel = (chain: CvsChain): string =>
  CVS_CHAINS.find((item) => item.chain === chain)?.label ?? chain;
