export const API_URL = "/api";
export const IMAGE_URL = "/uploads";
export const BACKEND_URL = "http://localhost:5000";

export const getFullImageUrl = (image: string | undefined | null) => {
  if (!image) return "";
  if (image.startsWith("http")) return image;
  if (image.startsWith("/uploads")) return image;
  return `${IMAGE_URL}/${image}`;
};
