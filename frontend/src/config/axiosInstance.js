import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // send the httpOnly refresh-token cookie on every request
  timeout: 15000, // don't hang forever if the backend is unreachable
});

// The access token lives here (module memory), not in Redux, so the axios
// interceptors below can read/write it without importing the store (which
// would create a circular import, since the store's thunks import this file).
let accessToken = null;
let onAuthChange = null; // wired once by main.jsx so Redux stays in sync

export const setAccessToken = (token) => {
  accessToken = token;
};

export const setAuthChangeHandler = (handler) => {
  onAuthChange = handler;
};

axiosInstance.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Routes where a 401 means "bad credentials" / "no session", not "access
// token expired" - retrying those with a refresh would either loop forever
// or make no sense.
const isExemptFromRefresh = (url = "") =>
  url.includes("/auth/login") ||
  url.includes("/auth/register") ||
  url.includes("/auth/refresh-token");

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && !isExemptFromRefresh(originalRequest?.url) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axiosInstance.post("/auth/refresh-token");
        setAccessToken(data.accessToken);
        onAuthChange?.(data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        onAuthChange?.(null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
