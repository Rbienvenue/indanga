export class ApiResponse<T> {
  public data: T;

  public success?: boolean;

  public message?: string;

  constructor(data: T, message = 'success', success = true) {
    this.data = data;
    this.success = success;
    this.message = message;
  }
}
class Metadata {
  total: number;

  page: number;

  limit: number;

  totalPages: number;

  constructor(total: number, page: number, limit: number, totalPages: number) {
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = totalPages;
  }
}

export class PaginationResponse<T> {
  data: T[];

  meta: Metadata;

  constructor(
    data: T[],
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    },
  ) {
    this.data = data;
    this.meta = meta;
  }
}