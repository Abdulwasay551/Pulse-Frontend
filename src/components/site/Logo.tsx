export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" fill="#0a2e36" />
      {/* The pulse line: a heartbeat/growth wave rising into the arrow. */}
      <path
        d="M4.5 22 L9.5 22 L12.5 10.5 L15.5 20 L18.5 13 L22 13 L26 7"
        stroke="#73b6c4"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arrowhead — orange, per brand spec. */}
      <path
        d="M21 7.4 L26.6 6.4 L25.6 12"
        stroke="#ff6b35"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* The people — teal dots riding the wave. */}
      <circle cx="12.5" cy="10.5" r="2.1" fill="#73b6c4" />
      <circle cx="18.5" cy="13" r="1.7" fill="#73b6c4" />
    </svg>
  );
}
