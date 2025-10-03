import { useState } from "react";

const useOpen = (defaultValue?: boolean) => {
  const [isOpen, setIsOpen] = useState(defaultValue ?? false);

  const open = () => setIsOpen(true);

  const close = () => setIsOpen(false);

  const toggle = () => setIsOpen((prev) => !prev);

  const update = (open: boolean) => setIsOpen(open);

  return {
    isOpen,
    open,
    close,
    toggle,
    update,
  };
};

export default useOpen;
