import { useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import CustomerDetail from "./components/CustomerDetail";
import EmptyState from "./components/EmptyState";
import AddCustomerModal from "./components/AddCustomerModal";
import ConfirmModal from "./components/ConfirmModal";
import Toast from "./components/Toast";
import { useCustomers } from "./hooks/useCustomers";
import type { Customer } from "./types";

export default function App() {
  const {
    customers,
    activeId,
    setActiveId,
    addCustomer,
    removeCustomer,
    updateCustomer,
    importCustomers,
  } = useCustomers();

  const [searchTerm, setSearchTerm] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const activeCustomer = customers.find((c) => c.id === activeId) ?? null;

  function showToast(message: string) {
    setToastMessage(message);
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2600);
  }

  function handleRemove(c: Customer) {
    setConfirmState({
      message: `Remove ${c.name} and all their deal data? This cannot be undone.`,
      onConfirm: () => {
        removeCustomer(c.id);
        setConfirmState(null);
        showToast(`${c.name} was removed.`);
      },
    });
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify({ customers }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `navida-customers-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(list: Customer[]) {
    importCustomers(list);
    showToast(`Imported ${list.length} customer${list.length === 1 ? "" : "s"}.`);
  }

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[300px_1fr]">
      <Sidebar
        customers={customers}
        activeId={activeId}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSelect={setActiveId}
        onOpenAddModal={() => setAddModalOpen(true)}
        onExport={handleExport}
        onImport={handleImport}
        onImportError={showToast}
      />

      <Toast message={toastMessage} visible={toastVisible} />

      <main className="max-w-[880px] px-5 py-9 md:px-11">
        {activeCustomer ? (
          <CustomerDetail
            customer={activeCustomer}
            onUpdate={(updater) => updateCustomer(activeCustomer.id, updater)}
            onRemove={() => handleRemove(activeCustomer)}
          />
        ) : (
          <EmptyState />
        )}
      </main>

      <AddCustomerModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={addCustomer}
      />

      <ConfirmModal
        open={confirmState !== null}
        title="Remove customer"
        message={confirmState?.message ?? ""}
        onCancel={() => setConfirmState(null)}
        onConfirm={() => confirmState?.onConfirm()}
      />
    </div>
  );
}
