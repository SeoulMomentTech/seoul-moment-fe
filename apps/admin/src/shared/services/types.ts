export interface ApiResponse<T> {
  result: boolean;
  data: T;
}

export type SortDirection = "ASC" | "DESC";
