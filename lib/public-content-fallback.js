const fallbackBasePath = '/fallback-data';

const resolveServerBaseUrls = () => {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXTAUTH_URL,
    process.env.SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : '',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
    // Final production fallback for this deployment family.
    'https://www.ajwaacademy.com',
    'http://localhost:3000',
  ]
    .map((value) => String(value || '').replace(/\/+$/, ''))
    .filter(Boolean);

  return [...new Set(candidates)];
};

const readServerFallbackJsonOverHttp = async (fileName) => {
  const baseUrls = resolveServerBaseUrls();
  let lastError = null;

  for (const baseUrl of baseUrls) {
    try {
      const response = await fetch(`${baseUrl}${fallbackBasePath}/${fileName}`, {
        cache: 'force-cache',
        next: { revalidate: 3600 },
      });
      if (!response.ok) {
        throw new Error(`Fallback HTTP fetch failed for ${fileName}: ${response.status} @ ${baseUrl}`);
      }
      return response.json();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error(`Fallback HTTP fetch failed for ${fileName}`);
};

const readServerFallbackJson = async (fileName) => {
  return readServerFallbackJsonOverHttp(fileName);
};

const readClientFallbackJson = async (fileName) => {
  const response = await fetch(`${fallbackBasePath}/${fileName}`, {
    cache: 'force-cache',
  });
  if (!response.ok) {
    throw new Error(`Fallback fetch failed for ${fileName}: ${response.status}`);
  }
  return response.json();
};

export const readFallbackJson = async (fileName) => {
  if (typeof window === 'undefined') {
    return readServerFallbackJson(fileName);
  }
  return readClientFallbackJson(fileName);
};
