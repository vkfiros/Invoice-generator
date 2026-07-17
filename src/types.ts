export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export type PaymentStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: PaymentStatus;
  sender: ContactInfo;
  client: ContactInfo;
  items: InvoiceItem[];
  taxRate: number; // percentage
  discount: number; // flat value
  notes: string;
  terms: string;
  currency: string;
}

export interface BusinessSettings {
  sender: ContactInfo;
  currency: string;
  taxRate: number;
  terms: string;
}
