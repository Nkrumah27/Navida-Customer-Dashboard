export default function EmptyState() {
  return (
    <div className="flex h-[80vh] max-w-[420px] flex-col items-start justify-center">
      <svg width="40" height="40" viewBox="0 0 34 34" fill="none">
        <circle cx="17" cy="17" r="16" stroke="#0F2E5C" strokeWidth="1.6" />
        <path
          d="M17 6 L20 15 L29 17 L20 19 L17 28 L14 19 L5 17 L14 15 Z"
          fill="#0F2E5C"
        />
      </svg>
      <h2 className="mb-2 mt-3.5 text-[26px] text-navy">
        Track a customer&rsquo;s deal
      </h2>
      <p className="m-0 mb-4.5 text-[15px] leading-relaxed text-ink-soft">
        Select a customer on the left, or add a new one to record their trip
        purpose, destination, charges, payments and to-dos.
      </p>
    </div>
  );
}
