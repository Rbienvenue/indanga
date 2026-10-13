import type { House as DatabaseHouse, RoomType as DatabaseRoomType } from "@indanga/db";

export type House = Omit<DatabaseHouse, "price" | "cautionFee"> & {
  price: number | null;
  cautionFee: number | null;
};
export type RoomType = Omit<DatabaseRoomType, "price"> & { price: number };

export interface ApiResponse<T> {
  data: T;
  success?: boolean;
  message?: string;
}

export interface PaginationResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
