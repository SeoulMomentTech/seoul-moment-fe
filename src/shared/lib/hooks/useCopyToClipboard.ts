import { useState } from "react";

type CopiedValue = string | null;
type CopyFn = (text: string) => Promise<boolean>;

const useCopyToClipboard = () => {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);
  const copy: CopyFn = async (text: string) => {
    if (!navigator.clipboard) {
      console.warn("Clipboard not supported");
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      return true;
    } catch {
      console.warn("copy failed");
      return false;
    }
  };

  return { copy, copiedText };
};

export default useCopyToClipboard;
