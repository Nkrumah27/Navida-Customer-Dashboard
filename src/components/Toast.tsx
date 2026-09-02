interface ToastProps {
  message: string;
  visible: boolean;
}

export default function Toast({ message, visible }: ToastProps) {
  return (
    <div
      className={`fixed left-1/2 bottom-6 z-[80] -translate-x-1/2 rounded-lg bg-navy px-5 py-3 text-sm text-white shadow-[0_8px_24px_rgba(15,46,92,0.25)] transition-all duration-200 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      {message}
    </div>
  );
}
