export function KickIcon({
  className,
  size = 16,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 4 L8 4 L8 10 L13.5 4 L18 4 L11.5 12 L18 20 L13.5 20 L8 14 L8 20 L4 20 Z" />
    </svg>
  );
}
