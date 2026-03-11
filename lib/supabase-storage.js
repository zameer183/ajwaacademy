import { supabase, supabaseEnabled } from "./supabase";

const bucketName = "media";
const storageDisabledMessage =
  "Supabase storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.";

export const uploadMedia = async ({ file, pathPrefix = "uploads", timeoutMs = 15000 }) => {
  if (!file) {
    throw new Error("File is required for upload.");
  }
  if (!supabaseEnabled || !supabase) {
    throw new Error(storageDisabledMessage);
  }

  const fileExt = file.name.split(".").pop();
  const safeUuid =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const fileName = `${safeUuid}.${fileExt}`;
  const filePath = `${pathPrefix}/${fileName}`;

  const uploadPromise = supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || undefined,
    });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Upload timed out")), timeoutMs)
  );

  const { error: uploadError } = await Promise.race([uploadPromise, timeoutPromise]);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  if (!data?.publicUrl) {
    throw new Error("Upload succeeded but public URL is missing.");
  }
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
    // ignore delete errors
  }
};
