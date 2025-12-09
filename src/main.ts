import { InvoiceStatus, PaymentMethod } from "./models/enum";
import { Invoice, InvoiceItem } from "./models/invoice.model";
import { InvoiceService } from "./services/invoice.service";
import { PaymentService } from "./services/payment.service";
import { ReceiptService } from "./services/receipt.service";

console.log("--- Invoice System Demo ---\n");

console.log("--- Scenario 1: Basic Invoice Calculation ---");
const taxRate = 0.07;
const items: InvoiceItem[] = [
  {
    id: "1",
    description: "Monthly Fee",
    quantity: 1,
    unitPrice: 500,
    taxRate,
    lineTotal: 0,
    taxAmount: 0,
  },
  {
    id: "2",
    description: "Activity Fee",
    quantity: 2,
    unitPrice: 25.5,
    taxRate,
    lineTotal: 0,
    taxAmount: 0,
  },
];

const total = InvoiceService.calculateInvoiceTotal(items, taxRate);
console.log(`Subtotal: ${total.subtotal}`);
console.log(`Tax: ${total.tax}`);
console.log(`Total: ${total.total}\n`);

console.log("--- Scenario 2: Multiple Payments ---");
const invoice: Invoice = {
  id: crypto.randomUUID(),
  invoiceNumber: "INV-001",
  invoiceDate: new Date(),
  items: items,
  totalAmount: 1000,
  totalTax: total.tax,
  outstandingAmount: 1000,
  status: InvoiceStatus.PENDING,
};

console.log(`Invoice Total: ${invoice.totalAmount}`);
console.log(`Initial Outstanding: ${invoice.outstandingAmount}\n`);

// First payment
const payment1 = PaymentService.processPayment(
  invoice,
  300,
  PaymentMethod.CASH
);
console.log(
  `Payment 1: ${payment1.payment.amount} (${payment1.payment.paymentMethod})`
);
console.log(
  `Outstanding after payment 1: ${payment1.updatedInvoice.outstandingAmount}`
);
console.log(`Status: ${payment1.updatedInvoice.status}\n`);

// Generate receipt for first payment
const receipt1 = ReceiptService.generateReceipt(
  payment1.payment,
  payment1.updatedInvoice
);
console.log(`Receipt ${receipt1.receiptNumber} generated`);
console.log(`Total Paid: ${receipt1.totalPaid}`);
console.log(`Remaining Balance: ${receipt1.remainingBalance}\n`);

// Second payment (overpayment)
const payment2 = PaymentService.processPayment(
  payment1.updatedInvoice,
  750,
  PaymentMethod.BANK_TRANSFER
);
console.log(
  `Payment 2: ${payment2.payment.amount} (${payment2.payment.paymentMethod})`
);
console.log(
  `Outstanding after payment 2: ${payment2.updatedInvoice.outstandingAmount}`
);
console.log(`Status: ${payment2.updatedInvoice.status}\n`);

// Generate receipt for second payment
const receipt2 = ReceiptService.generateReceipt(
  payment2.payment,
  payment2.updatedInvoice
);
console.log(`Receipt ${receipt2.receiptNumber} generated`);
console.log(`Total Paid: ${receipt2.totalPaid}`);
console.log(`Remaining Balance: ${receipt2.remainingBalance}\n`);

// Scenario 3: Edge Cases Demo
console.log("--- Scenario 3: Edge Cases ---");

// Zero-amount invoice attempt
try {
  console.log("Testing: Zero-amount invoice");
  InvoiceService.calculateInvoiceTotal([], 0.07);
} catch (error) {
  console.log(`Caught error: ${(error as Error).message}\n`);
}

// Negative amount attempt
try {
  console.log("Testing: Negative payment amount");
  PaymentService.processPayment(invoice, -100, PaymentMethod.CASH);
} catch (error) {
  console.log(`Caught error: ${(error as Error).message}\n`);
}

console.log("--- Demo Complete ---");
