const isProduction = import.meta.env.PROD;
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const API_URL = isProduction ? `${backendUrl}/api` : "/api";
export const IMAGE_URL = isProduction ? `${backendUrl}/uploads` : "/uploads";
export const BACKEND_URL = backendUrl;

export const getFullImageUrl = (image: string | undefined | null) => {
  if (!image) return "";
  if (image.startsWith("http")) return image;
  if (image.startsWith("/uploads")) return `${backendUrl}${image}`;
  return `${IMAGE_URL}/${image}`;
};
