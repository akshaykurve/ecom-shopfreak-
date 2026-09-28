// Centralizes how thunks turn an axios error into a user-facing message, so
// a backend that's simply unreachable doesn't show a blank/undefined toast.
export const getErrorMessage = (error, fallback) => {
  if (error.response) {
    return error.response.data?.message || fallback;
  }
  if (error.request) {
    return "Can't reach the server. Please check your connection and try again.";
  }
  return fallback;
};
