import mongoose from "mongoose";

export function safeId(id, label = "id") {
  if (!id || !mongoose.Types.ObjectId.isValid(String(id))) {
    return {
      valid: false,
      error: `Invalid ${label}`,
    };
  }

  return { valid: true, value: String(id) };
}

export function normalizePagination(searchParams = {}) {
  const page = Number(searchParams.page ?? 1);
  const limit = Number(searchParams.limit ?? 20);
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 20;
  const cappedLimit = Math.min(safeLimit, 100);

  return {
    page: safePage,
    limit: cappedLimit,
    skip: (safePage - 1) * cappedLimit,
  };
}

export function buildSort(sortBy = "createdAt", order = "desc") {
  const normalizedOrder = String(order).toLowerCase() === "asc" ? 1 : -1;
  return { [sortBy]: normalizedOrder };
}

export function normalizeSearch(value) {
  return typeof value === "string" ? value.trim() : "";
}
