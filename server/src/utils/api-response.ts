export function sendSuccess<T>(
  data: T,
  message = "Request completed successfully"
) {
  return {
    success: true,
    message,
    data
  };
}

export function sendError(message: string) {
  return {
    success: false,
    message,
    data: null
  };
}
