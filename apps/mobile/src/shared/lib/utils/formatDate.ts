export const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  // web(formatDateTime)과 같이 기기 로컬 시간 기준으로 맞춘다. UTC로 자르면 하루 어긋난다.
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
};
