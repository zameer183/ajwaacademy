export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <img
          src="/ajwa%20logo.png"
          alt="Ajwa Academy"
          className="h-24 w-auto mb-4 animate-pulse"
        />
        <div className="h-2 w-40 rounded-full bg-[rgba(0,0,102,0.15)] overflow-hidden">
          <div className="h-full w-1/2 bg-[rgba(0,0,102)] animate-[loadingBar_1.2s_ease-in-out_infinite]" />
        </div>
        <p className="mt-3 text-sm text-[rgba(0,0,102)]">Loading...</p>
      </div>
    </div>
  );
}
