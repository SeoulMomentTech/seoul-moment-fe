import { getUserFit, type GetUserFitRes } from "@shared/services/user";

import useAppQuery from "@/shared/lib/hooks/query/useAppQuery";

export function useGetUserFitQuery() {
  return useAppQuery<
    Awaited<ReturnType<typeof getUserFit>>,
    Error,
    GetUserFitRes
  >({
    queryKey: ["user", "fit"],
    queryFn: getUserFit,
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
  });
}
