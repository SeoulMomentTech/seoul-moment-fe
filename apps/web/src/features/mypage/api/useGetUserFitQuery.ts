import { getUserFit, type GetUserFitRes } from "@shared/services/user";

import useAppQuery from "@/shared/lib/hooks/query/useAppQuery";
import { useUserAuthStore } from "@/shared/lib/hooks/useUserAuthStore";

export function useGetUserFitQuery() {
  const { id } = useUserAuthStore();

  return useAppQuery<
    Awaited<ReturnType<typeof getUserFit>>,
    Error,
    GetUserFitRes
  >({
    queryKey: ["user", "fit", id],
    queryFn: getUserFit,
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}
