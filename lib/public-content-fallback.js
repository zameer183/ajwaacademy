const fallbackBasePath = '/fallback-data';

const readServerFallbackJson = async (fileName) => {
  const [{ readFile }, pathModule] = await Promise.all([
    import(/* webpackIgnore: true */ 'fs/promises'),
    import(/* webpackIgnore: true */ 'path'),
  ]);
  const filePath = pathModule.join(process.cwd(), 'public', 'fallback-data', fileName);
  return JSON.parse(await readFile(filePath, 'utf8'));
};

const readClientFallbackJson = async (fileName) => {
  const response = await fetch(`${fallbackBasePath}/${fileName}`, {
    cache: 'no-store',
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
