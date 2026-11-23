import { APP_NAME } from '../config/app';

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 64 64" className="size-8" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill="#b8a9f0" />
        <rect x="14" y="34" width="9" height="16" rx="3" fill="#fff" />
        <rect x="27.5" y="24" width="9" height="26" rx="3" fill="#fff" opacity="0.9" />
        <rect x="41" y="14" width="9" height="36" rx="3" fill="#fff" opacity="0.8" />
      </svg>
      <span className="text-base font-bold tracking-tight">{APP_NAME}</span>
    </div>
  );
}
