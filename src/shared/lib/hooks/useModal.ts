import { create } from "zustand";

interface ModalState {
  modalType: string | null;
  isOpen: boolean;
  openModal(type: string): void;
  closeModal(): void;
  setModalType(type: string): void;
  updateModal(open: boolean): void;
}

const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  modalType: null,
  updateModal: (isOpen) =>
    set({
      isOpen,
    }),
  openModal: (type) =>
    set({
      modalType: type,
      isOpen: true,
    }),
  closeModal: () =>
    set({
      modalType: null,
      isOpen: false,
    }),
  setModalType: (type) =>
    set({
      modalType: type,
    }),
}));

const useModal = () => {
  return useModalStore();
};

export default useModal;
