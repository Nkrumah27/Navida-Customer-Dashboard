import { useState, type ChangeEvent, type FormEvent } from "react";
import type { Customer } from "../types";
import {
  fmtDate,
  initials,
  money,
  purposeLabel,
  totalBalance,
  totalPaid,
} from "../utils";

interface CustomerDetailProps {
  customer: Customer;
  onUpdate: (updater: (c: Customer) => Customer) => void;
  onRemove: () => void;
}

export default function CustomerDetail({
  customer: c,
  onUpdate,
  onRemove,
}: CustomerDetailProps) {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [todoText, setTodoText] = useState("");

  const paid = totalPaid(c);
  const balance = totalBalance(c);
  const pct = c.totalAmount > 0 ? Math.min(100, Math.round((paid / c.totalAmount) * 100)) : 0;

  function handlePaymentSubmit(e: FormEvent) {
    e.preventDefault();
    let amt = parseFloat(paymentAmount);
    if (!amt || amt <= 0) return;
    if (amt > balance) amt = balance;
    onUpdate((cust) => ({
      ...cust,
      payments: [
        ...cust.payments,
        {
          amount: Math.round(amt * 100) / 100,
          date: new Date().toISOString(),
          note: paymentNote.trim(),
        },
      ],
    }));
    setPaymentAmount("");
    setPaymentNote("");
  }

  function addTodo() {
    const v = todoText.trim();
    if (!v) return;
    onUpdate((cust) => ({
      ...cust,
      todos: [...cust.todos, { text: v, done: false }],
    }));
    setTodoText("");
  }

  function toggleTodo(idx: number) {
    onUpdate((cust) => ({
      ...cust,
      todos: cust.todos.map((t, i) =>
        i === idx ? { ...t, done: !t.done } : t,
      ),
    }));
  }

  function deleteTodo(idx: number) {
    onUpdate((cust) => ({
      ...cust,
      todos: cust.todos.filter((_, i) => i !== idx),
    }));
  }

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const photo = ev.target?.result as string;
      onUpdate((cust) => ({ ...cust, photo }));
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <div className="flex items-start gap-5 border-b border-line pb-[22px]">
        <div className="flex h-24 w-24 flex-none items-center justify-center overflow-hidden rounded-2xl bg-navy-light font-serif text-[32px] font-bold text-white">
          {c.photo ? (
            <img src={c.photo} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(c.name)
          )}
        </div>
        <div>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="font-serif text-[28px] font-semibold text-navy">
              {c.name}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12.5px] font-semibold ${
                balance <= 0
                  ? "border-[#C9EBD9] bg-[#E4F6ED] text-ok"
                  : "border-[#D7E2F5] bg-[#EAF0FB] text-navy-light"
              }`}
            >
              {purposeLabel(c)}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" style={{ verticalAlign: -1 }}>
                <circle cx="6" cy="6" r="5" fill="#1C4B8C" />
              </svg>
              {c.country}
            </span>
            {c.phone && <span>{c.phone}</span>}
            {c.email && <span>{c.email}</span>}
          </div>
          <label
            htmlFor="mainPhotoInput"
            className="mt-2 inline-block cursor-pointer text-xs font-semibold text-navy-light"
          >
            Change photo
          </label>
          <input
            id="mainPhotoInput"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
          />
        </div>
      </div>

      <div className="border-b border-line py-6">
        <h3 className="m-0 mb-3.5 text-[15px] font-semibold text-navy">
          Deal summary
        </h3>
        <div className="mb-3.5 flex flex-wrap gap-8">
          <div>
            <div className="text-[12.5px] text-ink-soft">Total charged</div>
            <div className="font-serif text-[22px] font-bold text-navy">
              {money(c.totalAmount)}
            </div>
          </div>
          <div>
            <div className="text-[12.5px] text-ink-soft">Paid so far</div>
            <div className="font-serif text-[22px] font-bold text-ok">
              {money(paid)}
            </div>
          </div>
          <div>
            <div className="text-[12.5px] text-ink-soft">Balance left</div>
            <div
              className={`font-serif text-[22px] font-bold ${
                balance <= 0 ? "text-ok" : "text-danger"
              }`}
            >
              {money(balance)}
            </div>
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-full border border-line bg-[#E6ECF6]">
          <div
            className="h-full rounded-l-full bg-gradient-to-r from-gold to-gold-deep transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1.5 text-xs text-ink-soft">
          {pct}% of the deal is paid{balance <= 0 ? " — deal complete." : "."}
        </div>

        <form className="mt-4 flex gap-2" onSubmit={handlePaymentSubmit}>
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Amount"
            required
            disabled={balance <= 0}
            className="w-[150px] rounded-lg border border-line px-3 py-2.5 text-sm"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
          />
          <input
            type="text"
            placeholder="Note (optional, e.g. visa fee)"
            disabled={balance <= 0}
            className="flex-1 rounded-lg border border-line px-3 py-2.5 text-sm"
            value={paymentNote}
            onChange={(e) => setPaymentNote(e.target.value)}
          />
          <button
            type="submit"
            disabled={balance <= 0}
            className="rounded-lg bg-navy px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-navy-light disabled:cursor-not-allowed disabled:bg-[#B9C3D6]"
          >
            Record payment
          </button>
        </form>

        {c.payments.length === 0 ? (
          <p className="mt-4 text-[13.5px] italic text-ink-soft">
            No payments recorded yet.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col">
            {c.payments
              .slice()
              .reverse()
              .map((p, idx) => (
                <li
                  key={idx}
                  className="flex justify-between border-t border-line py-2.5 text-[13.5px] first:border-t-0"
                >
                  <span className="text-ink-soft">
                    {fmtDate(p.date)}
                    {p.note ? ` · ${p.note}` : ""}
                  </span>
                  <span className="font-semibold text-ok">+{money(p.amount)}</span>
                </li>
              ))}
          </ul>
        )}
      </div>

      <div className="border-b border-line py-6">
        <h3 className="m-0 mb-3.5 text-[15px] font-semibold text-navy">
          Customer details
        </h3>
        <div className="grid grid-cols-2 gap-x-5 gap-y-3">
          <div>
            <div className="mb-0.5 text-xs text-ink-soft">Purpose of travel</div>
            <div className="text-sm text-ink">{purposeLabel(c)}</div>
          </div>
          <div>
            <div className="mb-0.5 text-xs text-ink-soft">Destination</div>
            <div className="text-sm text-ink">{c.country}</div>
          </div>
          <div>
            <div className="mb-0.5 text-xs text-ink-soft">Phone</div>
            <div className="text-sm text-ink">{c.phone || "—"}</div>
          </div>
          <div>
            <div className="mb-0.5 text-xs text-ink-soft">Email</div>
            <div className="text-sm text-ink">{c.email || "—"}</div>
          </div>
        </div>
      </div>

      <div className="border-b border-line py-6">
        <h3 className="m-0 mb-3.5 text-[15px] font-semibold text-navy">
          To-do list
        </h3>
        <div className="mb-3.5 flex gap-2">
          <input
            type="text"
            placeholder="e.g. Collect passport copy"
            className="flex-1 rounded-lg border border-line px-3 py-2.5 text-sm"
            value={todoText}
            onChange={(e) => setTodoText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTodo();
              }
            }}
          />
          <button
            type="button"
            className="rounded-lg bg-navy px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-navy-light"
            onClick={addTodo}
          >
            Add
          </button>
        </div>

        {c.todos.length === 0 ? (
          <p className="text-[13.5px] italic text-ink-soft">
            Nothing on the to-do list yet — add documents, tasks or reminders
            for this deal.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {c.todos.map((t, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2.5 border-b border-line py-2.5 last:border-b-0"
              >
                <button
                  type="button"
                  aria-label="Toggle task"
                  className={`flex h-[19px] w-[19px] flex-none items-center justify-center rounded-[5px] border-[1.5px] ${
                    t.done ? "border-navy bg-navy" : "border-[#B9C3D6] bg-white"
                  }`}
                  onClick={() => toggleTodo(idx)}
                >
                  {t.done && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6.5L4.8 9L10 3"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
                <span
                  className={`flex-1 text-sm ${
                    t.done ? "text-ink-soft line-through" : ""
                  }`}
                >
                  {t.text}
                </span>
                <button
                  type="button"
                  aria-label="Delete task"
                  className="flex p-1 text-[#B9C3D6] hover:text-danger"
                  onClick={() => deleteTodo(idx)}
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path
                      d="M3 4h9M6 4V2.5h3V4M4.5 4l.5 8.5h5l.5-8.5"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pt-6">
        <button
          type="button"
          className="rounded-lg border border-[#EBCDCD] px-4 py-2.5 text-[13.5px] font-semibold text-danger hover:bg-[#FCEEEE]"
          onClick={onRemove}
        >
          Remove customer
        </button>
      </div>
    </div>
  );
}
