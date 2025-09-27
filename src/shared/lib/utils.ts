import { formatDate } from "date-fns";

export const formatDateTime = (datetime: string) =>
  formatDate(new Date(datetime), "yyyy.MM.dd");
