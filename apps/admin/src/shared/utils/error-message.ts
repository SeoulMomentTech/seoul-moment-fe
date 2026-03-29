import type { AxiosError } from "axios";

export const getErrorMessage = (err: Error): string => {
  return (err as AxiosError<{ message?: string }>)?.response?.data?.message || err.message;
};
