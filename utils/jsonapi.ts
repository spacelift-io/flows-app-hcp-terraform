/**
 * JSON:API utility functions for HCP Terraform API
 * Spec: https://jsonapi.org/format/#document-structure
 */

interface JsonApiResource {
  id: string;
  type: string;
  attributes?: Record<string, any>;
  relationships?: Record<string, JsonApiRelationship>;
  links?: JsonApiLinks;
  meta?: Record<string, any>;
}

interface JsonApiRelationship {
  data?: JsonApiResourceIdentifier | JsonApiResourceIdentifier[];
  links?: JsonApiLinks;
  meta?: Record<string, any>;
}

interface JsonApiResourceIdentifier {
  id: string;
  type: string;
  meta?: Record<string, any>;
}

interface JsonApiLinks {
  self?: string;
  related?: string;
  first?: string;
  last?: string;
  prev?: string;
  next?: string;
}

interface JsonApiDocument {
  data?: JsonApiResource | JsonApiResource[];
  included?: JsonApiResource[];
  meta?: Record<string, any>;
  links?: JsonApiLinks;
  errors?: JsonApiError[];
}

interface JsonApiError {
  id?: string;
  status?: string;
  code?: string;
  title?: string;
  detail?: string;
  source?: {
    pointer?: string;
    parameter?: string;
  };
  meta?: Record<string, any>;
}

/**
 * Extract the main resource data from a JSON:API response
 */
export function extractData<T = any>(
  response: JsonApiDocument,
): T | T[] | null {
  if (!response.data) return null;

  if (Array.isArray(response.data)) {
    return response.data.map((resource) =>
      flattenResource(resource, response.included),
    );
  }

  return flattenResource(response.data, response.included);
}

/**
 * Flatten a JSON:API resource by merging attributes and resolving relationships
 * Handles circular references and deep relationship resolution
 */
function flattenResource(
  resource: JsonApiResource,
  included: JsonApiResource[] = [],
  visited = new Set<string>(),
): any {
  const resourceKey = `${resource.type}:${resource.id}`;

  // Prevent infinite recursion from circular references
  if (visited.has(resourceKey)) {
    return { id: resource.id, type: resource.type };
  }

  visited.add(resourceKey);

  const result: any = {
    id: resource.id,
    type: resource.type,
    ...resource.attributes,
  };

  // Add meta if present
  // if (resource.meta) {
  //   result._meta = resource.meta;
  // }

  // // Add links if present
  // if (resource.links) {
  //   result._links = resource.links;
  // }

  // Resolve relationships with comprehensive handling
  if (resource.relationships) {
    for (const [key, relationship] of Object.entries(resource.relationships)) {
      if (relationship.data) {
        if (Array.isArray(relationship.data)) {
          result[key] = relationship.data.map((ref) => {
            const found = findIncludedResource(ref, included, visited);
            return found || { id: ref.id, type: ref.type };
          });
        } else {
          const found = findIncludedResource(
            relationship.data,
            included,
            visited,
          );
          result[key] = found || {
            id: relationship.data.id,
            type: relationship.data.type,
          };
        }
      } else {
        // Handle null relationships (important for HCP Terraform API)
        result[key] = null;
      }

      // // Include relationship meta and links
      // if (relationship.meta) {
      //   result[`${key}_meta`] = relationship.meta;
      // }
      // if (relationship.links) {
      //   result[`${key}_links`] = relationship.links;
      // }
    }
  }

  visited.delete(resourceKey);
  return result;
}

/**
 * Find a resource in the included array by type and id
 * Handles deep relationship resolution with circular reference protection
 */
function findIncludedResource(
  identifier: JsonApiResourceIdentifier,
  included: JsonApiResource[],
  visited = new Set<string>(),
): any | null {
  if (!identifier || !identifier.id || !identifier.type) {
    return null;
  }

  const resource = included.find(
    (item) => item.type === identifier.type && item.id === identifier.id,
  );

  if (!resource) {
    return null;
  }

  return flattenResource(resource, included, visited);
}

/**
 * Build query parameters for JSON:API requests
 * Enhanced with HCP Terraform specific features and validation
 */
export function buildJsonApiQuery(options: {
  fields?: Record<string, string[]>;
  include?: string[];
  filter?: Record<string, any>;
  sort?: string[];
  page?: {
    number?: number;
    size?: number;
    cursor?: string; // HCP Terraform uses cursor-based pagination
  };
  search?: string; // HCP Terraform supports search queries
}): Record<string, string> {
  const query: Record<string, string> = {};

  // Sparse field sets with validation
  if (options.fields) {
    for (const [type, fields] of Object.entries(options.fields)) {
      if (fields.length > 0) {
        query[`fields[${type}]`] = fields.join(",");
      }
    }
  }

  // Include related resources with deduplication
  if (options.include && options.include.length > 0) {
    const uniqueIncludes = [...new Set(options.include)];
    query.include = uniqueIncludes.join(",");
  }

  // Filters with proper encoding
  if (options.filter) {
    for (const [key, value] of Object.entries(options.filter)) {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          query[`filter[${key}]`] = value.join(",");
        } else {
          query[`filter[${key}]`] = String(value);
        }
      }
    }
  }

  // Sorting with validation
  if (options.sort && options.sort.length > 0) {
    query.sort = options.sort.join(",");
  }

  // Search functionality
  if (options.search && options.search.trim()) {
    query.search = options.search.trim();
  }

  // Enhanced pagination support
  if (options.page) {
    if (options.page.cursor) {
      query["page[cursor]"] = options.page.cursor;
    }
    if (options.page.number && options.page.number > 0) {
      query["page[number]"] = String(options.page.number);
    }
    if (
      options.page.size &&
      options.page.size > 0 &&
      options.page.size <= 100
    ) {
      query["page[size]"] = String(options.page.size);
    }
  }

  return query;
}

/**
 * Extract pagination info from JSON:API response
 * Simplified for HCP Terraform pagination
 */
export function extractPagination(response: JsonApiDocument): {
  "current-page": number;
  "next-page": number | null;
  "page-size": number;
  "prev-page": number | null;
  "total-count": number;
  "total-pages": number;
} {
  const links = response.links || {};
  const meta = response.meta || {};
  const pagination = meta.pagination || {};

  // Extract page numbers from links
  let nextPage: number | null = null;
  let prevPage: number | null = null;

  if (links.next) {
    const url = new URL(links.next, "https://app.terraform.io");
    const pageParam = url.searchParams.get("page[number]");
    nextPage = pageParam ? parseInt(pageParam, 10) : null;
  }

  if (links.prev) {
    const url = new URL(links.prev, "https://app.terraform.io");
    const pageParam = url.searchParams.get("page[number]");
    prevPage = pageParam ? parseInt(pageParam, 10) : null;
  }

  return {
    "current-page": pagination["current-page"] || meta["current-page"] || 1,
    "next-page": nextPage,
    "page-size": pagination["page-size"] || meta["page-size"] || 20,
    "prev-page": prevPage,
    "total-count": pagination["total-count"] || meta["total-count"] || 0,
    "total-pages": pagination["total-pages"] || meta["total-pages"] || 1,
  };
}

/**
 * Check if response contains errors
 */
export function hasErrors(response: JsonApiDocument): boolean {
  return Boolean(response.errors && response.errors.length > 0);
}

/**
 * Extract errors from JSON:API response
 */
export function extractErrors(response: JsonApiDocument): JsonApiError[] {
  return response.errors || [];
}

/**
 * Format errors for user display
 * Enhanced with HCP Terraform specific error handling
 */
export function formatErrors(errors: JsonApiError[]): string {
  return errors
    .map((error) => {
      const detail = error.detail || error.title || "Unknown error";

      // Add source information if available
      if (error.source?.pointer) {
        return `${detail} (at ${error.source.pointer})`;
      }
      if (error.source?.parameter) {
        return `${detail} (parameter: ${error.source.parameter})`;
      }

      return detail;
    })
    .join("; ");
}

/**
 * Create a custom error class for HCP Terraform API errors
 */
export class HCPTerraformAPIError extends Error {
  public readonly errors: JsonApiError[];
  public readonly status?: number;
  public readonly isRetryable: boolean;

  constructor(errors: JsonApiError[], status?: number) {
    const message = formatErrors(errors);
    super(message);

    this.name = "HCPTerraformApiError";
    this.errors = errors;
    this.status = status;

    // Determine if error is retryable based on status codes
    this.isRetryable = status
      ? [429, 500, 502, 503, 504].includes(status)
      : false;
  }

  /**
   * Check if any error is related to authentication
   */
  get isAuthError(): boolean {
    return this.errors.some(
      (error) => error.status === "401" || error.status === "403",
    );
  }

  /**
   * Check if any error is related to rate limiting
   */
  get isRateLimitError(): boolean {
    return this.errors.some(
      (error) => error.status === "429" || error.code === "rate_limit_exceeded",
    );
  }

  /**
   * Check if any error is related to validation
   */
  get isValidationError(): boolean {
    return this.errors.some(
      (error) => error.status === "422" || error.status === "400",
    );
  }
}

/**
 * Validate JSON:API response structure
 */
export function validateJsonApiResponse(response: any): JsonApiDocument {
  if (!response || typeof response !== "object") {
    throw new Error("Invalid JSON:API response: not an object");
  }

  if (!response.data && !response.errors && !response.meta) {
    throw new Error("Invalid JSON:API response: missing required properties");
  }

  if (response.errors && !Array.isArray(response.errors)) {
    throw new Error("Invalid JSON:API response: errors must be an array");
  }

  if (response.data && response.errors) {
    throw new Error(
      "Invalid JSON:API response: cannot have both data and errors",
    );
  }

  return response as JsonApiDocument;
}
