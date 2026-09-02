export type Purpose = "School" | "Work" | "Visit" | "Other";

export interface Payment {
  amount: number;
  date: string;
  note?: string;
}

export interface Todo {
  text: string;
  done: boolean;
}

export interface Customer {
  id: string;
  name: string;
  purpose: Purpose;
  purposeOther?: string;
  country: string;
  phone?: string;
  email?: string;
  totalAmount: number;
  photo?: string | null;
  payments: Payment[];
  todos: Todo[];
}
