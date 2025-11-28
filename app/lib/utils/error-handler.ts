/**
 * Extract error message from API response
 */
export function extractErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred';
  
  // If error has message property
  if (error.message) {
    // Handle array of error messages
    if (Array.isArray(error.message)) {
      return error.message
        .map((m: any) => m.message || String(m))
        .join(', ');
    }
    // Handle string message
    if (typeof error.message === 'string') {
      return error.message;
    }
  }
  
  // Handle error property
  if (error.error) {
    return typeof error.error === 'string' ? error.error : String(error.error);
  }
  
  // Fallback
  return String(error);
}

/**
 * Handle API errors consistently
 */
export async function handleApiError(response: Response): Promise<never> {
  let errorData: any;
  
  try {
    errorData = await response.json();
  } catch {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const message = extractErrorMessage(errorData);
  throw new Error(message);
}
