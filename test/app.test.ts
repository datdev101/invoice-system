import assert from "assert";
import test from "node:test";
import { InvoiceStatus, PaymentMethod } from "../src/models/enum";
import { Invoice, InvoiceItem } from "../src/models/invoice.model";
import { InvoiceService } from "../src/services/invoice.service";
import { PaymentService } from "../src/services/payment.service";
import { ReceiptService } from "../src/services/receipt.service";

test("Complete invoice workflow: create, calculate, pay, and receipt", () => {
  // 1. Create invoice items
  const items: InvoiceItem[] = [
    {
      id: "1",
      description: "Consulting Services",
      quantity: 10,
      unitPrice: 150,
      taxRate: 0.1,
      lineTotal: 0,
      taxAmount: 0,
    },
    {
      id: "2",
      description: "Software License",
      quantity: 1,
      unitPrice: 500,
      taxRate: 0.1,
      lineTotal: 0,
      taxAmount: 0,
    },
  ];

  // 2. Calculate invoice totals
  const totals = InvoiceService.calculateInvoiceTotal(items, 0.1);
  assert.strictEqual(totals.subtotal, 2000);
  assert.strictEqual(totals.tax, 200);
  assert.strictEqual(totals.total, 2200);

  // 3. Create invoice
  const invoice: Invoice = {
    id: "inv-1",
    invoiceNumber: "INV-001",
    invoiceDate: new Date(),
    items: items,
    totalAmount: totals.total,
    totalTax: totals.tax,
    outstandingAmount: totals.total,
    status: InvoiceStatus.PENDING,
  };

  // 4. Process payment
  const paymentResult = PaymentService.processPayment(
    invoice,
    2200,
    PaymentMethod.BANK_TRANSFER
  );

  assert.strictEqual(paymentResult.updatedInvoice.status, InvoiceStatus.PAID);
  assert.strictEqual(paymentResult.updatedInvoice.outstandingAmount, 0);

  // 5. Generate receipt
  const receipt = ReceiptService.generateReceipt(
    paymentResult.payment,
    paymentResult.updatedInvoice
  );

  assert.strictEqual(receipt.totalPaid, 2200);
  assert.strictEqual(receipt.remainingBalance, 0);
  assert.strictEqual(receipt.items.length, 2);
});

test("Multiple partial payments workflow", () => {
  const items: InvoiceItem[] = [
    {
      id: "1",
      description: "Project Phase 1",
      quantity: 1,
      unitPrice: 1000,
      taxRate: 0.08,
      lineTotal: 0,
      taxAmount: 0,
    },
  ];

  const totals = InvoiceService.calculateInvoiceTotal(items, 0.08);

  const invoice: Invoice = {
    id: "inv-1",
    invoiceNumber: "INV-001",
    invoiceDate: new Date(),
    items: items,
    totalAmount: totals.total,
    totalTax: totals.tax,
    outstandingAmount: totals.total,
    status: InvoiceStatus.PENDING,
  };

  // First payment: 40%
  const payment1 = PaymentService.processPayment(
    invoice,
    432,
    PaymentMethod.CASH
  );
  const receipt1 = ReceiptService.generateReceipt(
    payment1.payment,
    payment1.updatedInvoice
  );
  assert.strictEqual(receipt1.remainingBalance, 648);

  // Second payment: 40%
  const payment2 = PaymentService.processPayment(
    payment1.updatedInvoice,
    432,
    PaymentMethod.BANK_TRANSFER
  );
  const receipt2 = ReceiptService.generateReceipt(
    payment2.payment,
    payment2.updatedInvoice
  );
  assert.strictEqual(receipt2.remainingBalance, 216);

  // Final payment: remaining 20%
  const payment3 = PaymentService.processPayment(
    payment2.updatedInvoice,
    216,
    PaymentMethod.CARD
  );
  const receipt3 = ReceiptService.generateReceipt(
    payment3.payment,
    payment3.updatedInvoice
  );
  assert.strictEqual(receipt3.remainingBalance, 0);
  assert.strictEqual(payment3.updatedInvoice.status, InvoiceStatus.PAID);
});

test("Rounding precision across multiple operations", () => {
  const items: InvoiceItem[] = [
    {
      id: "1",
      description: "Item with decimal",
      quantity: 3,
      unitPrice: 33.33,
      taxRate: 0.07,
      lineTotal: 0,
      taxAmount: 0,
    },
  ];

  const totals = InvoiceService.calculateInvoiceTotal(items, 0.07);

  // Verify rounding: 3 * 33.33 = 99.99, tax = 6.9993 rounded to 7.00, total = 106.99
  assert.strictEqual(totals.subtotal, 99.99);
  assert.strictEqual(totals.tax, 7.0);
  assert.strictEqual(totals.total, 106.99);
});

test("Different payment methods generate correct payment records", () => {
  const invoice: Invoice = {
    id: "inv-1",
    invoiceNumber: "INV-001",
    invoiceDate: new Date(),
    items: [],
    totalAmount: 300,
    totalTax: 21,
    outstandingAmount: 300,
    status: InvoiceStatus.PENDING,
  };

  const cashPayment = PaymentService.processPayment(
    invoice,
    100,
    PaymentMethod.CASH
  );
  assert.strictEqual(cashPayment.payment.paymentMethod, PaymentMethod.CASH);

  const bankPayment = PaymentService.processPayment(
    cashPayment.updatedInvoice,
    100,
    PaymentMethod.BANK_TRANSFER
  );
  assert.strictEqual(
    bankPayment.payment.paymentMethod,
    PaymentMethod.BANK_TRANSFER
  );

  const cardPayment = PaymentService.processPayment(
    bankPayment.updatedInvoice,
    100,
    PaymentMethod.CARD
  );
  assert.strictEqual(cardPayment.payment.paymentMethod, PaymentMethod.CARD);
  assert.strictEqual(cardPayment.updatedInvoice.status, InvoiceStatus.PAID);
});
