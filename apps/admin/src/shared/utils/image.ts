import { uploadAdminImage } from "@shared/services/upload";

export const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const uploadImageFile = async (file: File, folder: string) => {
  const base64 = await fileToBase64(file);
  const { data } = await uploadAdminImage({ base64, folder });
  return data.imagePath;
};
