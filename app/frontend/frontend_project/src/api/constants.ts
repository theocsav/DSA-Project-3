// Hide API endpoints by using environment variables
export const getApiBase = () => {
  return import.meta.env.VITE_API_BASE_URL ||'';
};