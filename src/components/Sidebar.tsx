import { useRef, type ChangeEvent } from "react";
import type { Customer } from "../types";
import { initials, money, purposeLabel, totalBalance } from "../utils";

interface SidebarProps {
  customers: Customer[];
  activeId: string | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  onOpenAddModal: () => void;
  onExport: () => void;
  onImport: (customers: Customer[]) => void;
  onImportError: (message: string) => void;
}

export default function Sidebar({
  customers,
  activeId,
  searchTerm,
  onSearchChange,
  onSelect,
  onOpenAddModal,
  onExport,
  onImport,
  onImportError,
}: SidebarProps) {
  const importInputRef = useRef<HTMLInputElement>(null);

  const filtered = customers.filter((c) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(t) || c.country.toLowerCase().includes(t)
    );
  });

  function handleImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data && Array.isArray(data.customers)) {
          onImport(data.customers as Customer[]);
        } else {
          onImportError("This file doesn't look like a Navida export.");
        }
      } catch {
        onImportError("Could not read that file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <aside className="flex flex-col gap-[18px] bg-navy px-[18px] py-6 text-white">
      <div className="flex items-center gap-3.5 pb-1">
        <img
          src="/logo.png"
          alt="Navida Travel and Tour logo"
          className="block h-10 w-16 flex-none object-contain"
        />
        <div className="text-[19px] font-semibold leading-tight">
          Navida Travel
          <br />& Tour
        </div>
      </div>

      <button
        type="button"
        className="flex items-center justify-center gap-2 rounded-lg bg-gold px-3.5 py-2.5 text-sm font-bold text-navy transition-colors hover:bg-gold-deep"
        onClick={onOpenAddModal}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 1V13M1 7H13"
            stroke="#0F2E5C"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Add customer
      </button>

      <div className="relative">
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          className="absolute left-2.5 top-1/2 -translate-y-1/2"
        >
          <circle cx="6.5" cy="6.5" r="5" stroke="#9FB3D6" strokeWidth="1.6" />
          <path
            d="M10.5 10.5L13.5 13.5"
            stroke="#9FB3D6"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          placeholder="Search customers or country"
          className="w-full rounded-lg border border-white/20 bg-white/10 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-[#9FB3D6]"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex justify-between px-0.5 pt-1 text-xs text-[#9FB3D6]">
          <span>Customers</span>
          <span>{customers.length}</span>
        </div>
        <ul className="-mr-2 flex flex-1 flex-col gap-1 overflow-y-auto pr-2">
          {customers.length === 0 && (
            <li className="px-1.5 py-3.5 text-sm leading-relaxed text-[#9FB3D6]">
              No customers yet. Add your first customer to start tracking
              their deal.
            </li>
          )}
          {customers.length > 0 && filtered.length === 0 && (
            <li className="px-1.5 py-3.5 text-sm leading-relaxed text-[#9FB3D6]">
              No matches for "{searchTerm}".
            </li>
          )}
          {filtered.map((c) => {
            const balance = totalBalance(c);
            const isActive = c.id === activeId;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-2.5 rounded-[9px] border px-2.5 py-2.5 text-left text-white ${
                    isActive
                      ? "border-white/20 bg-white/10"
                      : "border-transparent hover:bg-white/[0.07]"
                  }`}
                  onClick={() => onSelect(c.id)}
                >
                  <span className="flex h-9 w-9 flex-none items-center justify-center overflow-hidden rounded-full border border-white/25 bg-navy-light text-sm font-bold text-white">
                    {c.photo ? (
                      <img
                        src={c.photo}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials(c.name)
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {c.name}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-xs text-[#AFC2E0]">
                      {purposeLabel(c)} · {c.country}
                    </span>
                  </span>
                  <span
                    className={`flex-none text-xs font-semibold ${
                      balance <= 0 ? "text-[#8FE3BE]" : "text-gold"
                    }`}
                  >
                    {balance <= 0 ? "Paid" : money(balance)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex gap-2 border-t border-white/10 pt-2.5">
        <button
          type="button"
          className="flex-1 rounded-lg border border-white/25 px-2.5 py-2 text-[12.5px] font-semibold text-[#D9E3F2] hover:bg-white/[0.08]"
          onClick={onExport}
        >
          Export data
        </button>
        <button
          type="button"
          className="flex-1 rounded-lg border border-white/25 px-2.5 py-2 text-[12.5px] font-semibold text-[#D9E3F2] hover:bg-white/[0.08]"
          onClick={() => importInputRef.current?.click()}
        >
          Import data
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept="application/json"
          onChange={handleImportFile}
        />
      </div>
    </aside>
  );
}
