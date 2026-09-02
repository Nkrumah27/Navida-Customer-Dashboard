import { useState, type FormEvent } from "react";
import type { Purpose } from "../types";
import type { NewCustomerInput } from "../hooks/useCustomers";

interface AddCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: NewCustomerInput) => void;
}

const emptyForm = {
  name: "",
  purpose: "School" as Purpose,
  purposeOther: "",
  country: "",
  phone: "",
  email: "",
  totalAmount: "",
  paidNow: "0",
};

export default function AddCustomerModal({
  open,
  onClose,
  onSave,
}: AddCustomerModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState<string | null>(null);

  if (!open) return null;

  function resetAndClose() {
    setForm(emptyForm);
    setPhoto(null);
    onClose();
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const totalAmount = parseFloat(form.totalAmount) || 0;
    if (!form.name.trim() || !form.country.trim() || totalAmount <= 0) return;

    onSave({
      name: form.name.trim(),
      purpose: form.purpose,
      purposeOther: form.purposeOther.trim(),
      country: form.country.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      totalAmount,
      paidNow: parseFloat(form.paidNow) || 0,
      photo,
    });
    resetAndClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/45 p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) resetAndClose();
      }}
    >
      <div className="max-h-[88vh] w-full max-w-[480px] overflow-y-auto rounded-2xl bg-white p-7">
        <h2 className="m-0 mb-1 text-[22px] font-semibold text-navy">
          New customer
        </h2>
        <p className="m-0 mb-5 text-[13.5px] text-ink-soft">
          Add a customer and their deal details.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3.5">
            <label
              htmlFor="f_name"
              className="mb-1.5 block text-[13px] font-semibold text-ink"
            >
              Full name
            </label>
            <input
              id="f_name"
              type="text"
              required
              placeholder="e.g. Ama Boateng"
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="mb-3.5 flex gap-3">
            <div className="flex-1">
              <label
                htmlFor="f_purpose"
                className="mb-1.5 block text-[13px] font-semibold text-ink"
              >
                Purpose
              </label>
              <select
                id="f_purpose"
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm"
                value={form.purpose}
                onChange={(e) =>
                  setForm({ ...form, purpose: e.target.value as Purpose })
                }
              >
                <option value="School">School</option>
                <option value="Work">Work</option>
                <option value="Visit">Visit</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {form.purpose === "Other" && (
              <div className="flex-1">
                <label
                  htmlFor="f_purpose_other"
                  className="mb-1.5 block text-[13px] font-semibold text-ink"
                >
                  Specify
                </label>
                <input
                  id="f_purpose_other"
                  type="text"
                  placeholder="e.g. Medical trip"
                  className="w-full rounded-lg border border-line px-3 py-2.5 text-sm"
                  value={form.purposeOther}
                  onChange={(e) =>
                    setForm({ ...form, purposeOther: e.target.value })
                  }
                />
              </div>
            )}
          </div>

          <div className="mb-3.5">
            <label
              htmlFor="f_country"
              className="mb-1.5 block text-[13px] font-semibold text-ink"
            >
              Destination country
            </label>
            <input
              id="f_country"
              type="text"
              required
              placeholder="e.g. Canada"
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </div>

          <div className="mb-3.5 flex gap-3">
            <div className="flex-1">
              <label
                htmlFor="f_phone"
                className="mb-1.5 block text-[13px] font-semibold text-ink"
              >
                Phone
              </label>
              <input
                id="f_phone"
                type="text"
                placeholder="e.g. 024 123 4567"
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="f_email"
                className="mb-1.5 block text-[13px] font-semibold text-ink"
              >
                Email
              </label>
              <input
                id="f_email"
                type="text"
                placeholder="optional"
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-3.5">
            <label
              htmlFor="f_amount"
              className="mb-1.5 block text-[13px] font-semibold text-ink"
            >
              Total amount to charge (GH₵)
            </label>
            <input
              id="f_amount"
              type="number"
              min={0}
              step="0.01"
              required
              placeholder="e.g. 12000"
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm"
              value={form.totalAmount}
              onChange={(e) =>
                setForm({ ...form, totalAmount: e.target.value })
              }
            />
          </div>

          <div className="mb-3.5">
            <label
              htmlFor="f_paid"
              className="mb-1.5 block text-[13px] font-semibold text-ink"
            >
              Amount already paid (GH₵)
            </label>
            <input
              id="f_paid"
              type="number"
              min={0}
              step="0.01"
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm"
              value={form.paidNow}
              onChange={(e) => setForm({ ...form, paidNow: e.target.value })}
            />
          </div>

          <div className="mb-3.5">
            <label className="mb-1.5 block text-[13px] font-semibold text-ink">
              Photo
            </label>
            <div className="flex items-center gap-3.5">
              <div className="flex h-[60px] w-[60px] flex-none items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-paper">
                {photo ? (
                  <img
                    src={photo}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                  >
                    <circle
                      cx="11"
                      cy="8"
                      r="3.2"
                      stroke="#9FB3D6"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M3 19c1.6-3.6 5-5.6 8-5.6s6.4 2 8 5.6"
                      stroke="#9FB3D6"
                      strokeWidth="1.4"
                    />
                  </svg>
                )}
              </div>
              <label
                htmlFor="f_photo"
                className="cursor-pointer rounded-lg border border-line bg-white px-3.5 py-2 text-[13px] font-semibold text-navy hover:bg-paper"
              >
                Choose photo
              </label>
              <input
                id="f_photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2.5">
            <button
              type="button"
              className="rounded-lg px-3.5 py-2.5 text-sm font-semibold text-ink-soft"
              onClick={resetAndClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-gold px-5 py-2.5 text-sm font-bold text-navy transition-colors hover:bg-gold-deep"
            >
              Save customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
