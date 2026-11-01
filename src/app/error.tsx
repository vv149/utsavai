"use client";

/** Route-level error boundary — catches per-route render errors. */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-neutral-400 max-w-md">
        {error.digest
          ? "An unexpected error occurred. Please try again."
          : error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-red-700 px-6 py-2 text-white hover:bg-red-600 transition-colors"
      >
        Try again
      </button>
    </main>
  );
}
