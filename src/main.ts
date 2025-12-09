import { InvoiceStatus, PaymentMethod } from "./models/enum";
import { Invoice, InvoiceItem } from "./models/invoice.model";
import { InvoiceService } from "./services/invoice.service";
import { PaymentService } from "./services/payment.service";

const taxRate = 0.07;
const items: InvoiceItem[] = [
  {
    id: "1",
    description: "Monthly Fee",
    quantity: 1,
    unitPrice: 500,
    taxRate,
    // assume this is default value
    lineTotal: 0,
    taxAmount: 0,
  },
  {
    id: "2",
    description: "Activity Fee",
    quantity: 2,
    unitPrice: 25.5,
    taxRate,
    // assume this is default value
    lineTotal: 0,
    taxAmount: 0,
  },
];

const totals = InvoiceService.calculateInvoiceTotal(items, taxRate);

const invoice: Invoice = {
  id: "1",
  invoiceNumber: "INV-001",
  invoiceDate: new Date(),
  items,
  totalAmount: 1000,
  totalTax: totals.tax,
  outstandingAmount: 1000,
  status: InvoiceStatus.PENDING,
};

const result1 = PaymentService.processPayment(invoice, 300, PaymentMethod.CASH);
console.log(result1);
const result2 = PaymentService.processPayment(invoice, 750, PaymentMethod.CASH);
console.log(result2);
