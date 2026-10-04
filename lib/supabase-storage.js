import { supabase, supabaseEnabled } from "./supabase";

const bucketName = "media";

export const uploadMedia = async ({ file, pathPrefix = "uploads" }) => {
  if (!file) {
    throw new Error("File is required for upload.");
  }

  // 1. First try server-side upload endpoint (bypasses RLS issues)
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", pathPrefix);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.publicUrl) {
        return {
          path: data.path,
          publicUrl: data.publicUrl,
        };
      }
    }
  } catch (err) {
    console.warn("Server upload fallback:", err);
  }

  // 2. Direct client fallback
  if (!supabaseEnabled || !supabase) {
    throw new Error("Supabase is not configured.");
  }

  const normalizedPrefix = String(pathPrefix || "uploads").replace(/^\/+|\/+$/g, "") || "uploads";
  const ext = file.name?.split(".").pop() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
  const filePath = `${normalizedPrefix}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return {
    path: filePath,
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
