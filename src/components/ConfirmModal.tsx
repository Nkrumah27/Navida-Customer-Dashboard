interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/45 p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-[380px] rounded-2xl bg-white p-7">
        <h2 className="m-0 mb-1 text-[22px] font-semibold text-navy">
          {title}
        </h2>
        <p className="m-0 mb-5 text-[14.5px] leading-relaxed text-ink-soft">
          {message}
        </p>
        <div className="mt-5 flex justify-end gap-2.5">
          <button
            type="button"
            className="rounded-lg px-3.5 py-2.5 text-sm font-semibold text-ink-soft"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-lg border border-[#EBCDCD] px-4 py-2.5 text-[13.5px] font-semibold text-danger hover:bg-[#FCEEEE]"
            onClick={onConfirm}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
