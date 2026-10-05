import { supabase, supabaseEnabled } from "./supabase";

const bucketName = "media";

export const uploadMedia = async ({ file, pathPrefix = "uploads" }) => {
  if (!file) {
    throw new Error("File is required for upload.");
  }

  // 1. Direct server upload via /api/admin/upload (bypasses browser RLS issues)
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", pathPrefix);

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || "Image upload failed.");
  }

  if (!data.publicUrl) {
    throw new Error("Upload succeeded but public URL is missing.");
  }

  return {
    path: data.path,
    publicUrl: data.publicUrl,
  };
};

export const deleteMediaByUrl = async (publicUrl) => {
  if (!publicUrl) return;
  if (!supabaseEnabled || !supabase) return;
  try {
    const url = new URL(publicUrl);
    const parts = url.pathname.split(`/storage/v1/object/public/${bucketName}/`);
    const filePath = parts?.[1];
    if (!filePath) return;
    await supabase.storage.from(bucketName).remove([filePath]);
  } catch {
    // ignore
  }
};
