import {
  validateJsonApiResponse,
  hasErrors,
  extractErrors,
  HCPTerraformAPIError,
} from "./jsonapi.ts";

/**
 * Convert kebab-case string to camelCase
 */
function kebabToCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Recursively convert all kebab-case keys in an object to camelCase
 */
function convertKeysToCamelCase(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToCamelCase(item));
  }

  if (typeof obj === "object") {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = kebabToCamelCase(key);
      result[camelKey] = convertKeysToCamelCase(value);
    }
    return result;
  }

  return obj;
}

export interface HCPTerraformConfig {
  apiToken: string;
  apiEndpoint: string;
  organization: string;
}

/**
 * Build query parameters for HCP Terraform API
 * Generic helper that accepts any query parameters
 */
function buildQueryParams(params: Record<string, any>): Record<string, string> {
  const query: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query[key] = String(value);
    }
  }

  return query;
}

/**
 * Make a request to the HCP Terraform API
 * Handles authentication, JSON:API format, and error handling
 * Generic helper that can be used for any HCP Terraform API endpoint
 */
export async function makeHCPTerraformRequest(
  config: HCPTerraformConfig,
  endpoint: string,
  options: {
    method?: string;
    body?: any;
    queryParams?: Record<string, any>;
  } = {},
): Promise<any> {
  const { method = "GET", body, queryParams } = options;

  const url = new URL(`${config.apiEndpoint}${endpoint}`);

  // Add query parameters using the generic helper
  if (queryParams) {
    const query = buildQueryParams(queryParams);
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.apiToken}`,
    "Content-Type": "application/vnd.api+json",
  };

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const responseData = await response.json();

  if (!response.ok) {
    if (hasErrors(responseData)) {
      throw new HCPTerraformAPIError(
        extractErrors(responseData),
        response.status,
      );
    }
    throw new Error(
      `HCP Terraform API error: ${response.status} ${response.statusText}`,
    );
  }

  const validatedResponse = validateJsonApiResponse(responseData);
  return convertKeysToCamelCase(validatedResponse);
}
