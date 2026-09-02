import { useState } from "react";
import type { Customer, Purpose } from "../types";
import { uid } from "../utils";

export interface NewCustomerInput {
  name: string;
  purpose: Purpose;
  purposeOther: string;
  country: string;
  phone: string;
  email: string;
  totalAmount: number;
  paidNow: number;
  photo: string | null;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  function addCustomer(input: NewCustomerInput) {
    const totalAmount = Math.round(input.totalAmount * 100) / 100;
    const customer: Customer = {
      id: uid(),
      name: input.name,
      purpose: input.purpose,
      purposeOther: input.purposeOther,
      country: input.country,
      phone: input.phone,
      email: input.email,
      totalAmount,
      photo: input.photo,
      payments: [],
      todos: [],
    };
    if (input.paidNow > 0) {
      customer.payments.push({
        amount: Math.min(input.paidNow, totalAmount),
        date: new Date().toISOString(),
        note: "Initial payment",
      });
    }
    setCustomers((prev) => [...prev, customer]);
    setActiveId(customer.id);
    return customer;
  }

  function removeCustomer(id: string) {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setActiveId((prev) => (prev === id ? null : prev));
  }

  function updateCustomer(id: string, updater: (c: Customer) => Customer) {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? updater(c) : c)),
    );
  }

  function importCustomers(list: Customer[]) {
    setCustomers(list);
    setActiveId(list.length ? list[0].id : null);
  }

  return {
    customers,
    activeId,
    setActiveId,
    addCustomer,
    removeCustomer,
    updateCustomer,
    importCustomers,
  };
}
