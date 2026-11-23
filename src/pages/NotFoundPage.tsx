import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="grid min-h-dvh place-items-center px-5 text-center">
      <div>
        <p className="text-primary text-sm font-semibold">404</p>
        <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
        <p className="text-text-muted mt-2 text-sm">The page you're looking for doesn't exist.</p>
        <Link to="/" className="text-primary mt-6 inline-block font-semibold hover:underline">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
