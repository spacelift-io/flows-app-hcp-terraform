/**
 * Shared pagination schema for HCP Terraform API responses
 */
export const paginationSchema = {
  type: "object",
  properties: {
    currentPage: { type: "number" },
    nextPage: { type: "number" },
    pageSize: { type: "number" },
    prevPage: { type: "number" },
    totalCount: { type: "number" },
    totalPages: { type: "number" },
  },
};
