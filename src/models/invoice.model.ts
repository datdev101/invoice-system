import { InvoiceStatus } from "./enum";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  taxRate: number;
  taxAmount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  items: InvoiceItem[];
  totalAmount: number;
  totalTax: number;
  outstandingAmount: number;
  status: InvoiceStatus;
}

interface InvoiceTotals {
  subtotal: number;
  tax: number;
  total: number;
}

export { Invoice, InvoiceItem, InvoiceTotals };
