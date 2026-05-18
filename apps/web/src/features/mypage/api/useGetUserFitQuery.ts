import { getUserFit, type UserFit } from "@shared/services/user";

import useAppQuery from "@/shared/lib/hooks/query/useAppQuery";

export function useGetUserFitQuery() {
  return useAppQuery<Awaited<ReturnType<typeof getUserFit>>, Error, UserFit>({
    queryKey: ["user", "fit"],
    queryFn: getUserFit,
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
  });
}
