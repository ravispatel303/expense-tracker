export function Spinner() {
  return (
    <span
      role="status"
      aria-label="Loading"
      className="border-primary-soft border-t-primary inline-block size-6 animate-spin rounded-full border-2"
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <Spinner />
    </div>
  );
}
