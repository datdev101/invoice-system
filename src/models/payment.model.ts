import { PaymentMethod, PaymentStatus } from "./enum";
import { Invoice } from "./invoice.model";

interface Payment {
  id: string;
  invoiceId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  paymentDate: Date;
  referenceNumber: string;
  status: PaymentStatus;
}

interface PaymentResult {
  payment: Payment;
  updatedInvoice: Invoice;
}

export { Payment, PaymentResult };
