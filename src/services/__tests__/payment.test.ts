import assert from "assert";
import test from "node:test";
import { InvoiceStatus, PaymentMethod, PaymentStatus } from "../../models/enum";
import { Invoice, InvoiceItem } from "../../models/invoice.model";
import { InvoiceService } from "../invoice.service";
import { PaymentService } from "../payment.service";

test("Process full payment for invoice", () => {
  const invoice: Invoice = {
    id: "inv-1",
    invoiceNumber: "INV-001",
    invoiceDate: new Date(),
    items: [],
    totalAmount: 1000,
    totalTax: 70,
    outstandingAmount: 1000,
    status: InvoiceStatus.PENDING,
  };

  const result = PaymentService.processPayment(
    invoice,
    1000,
    PaymentMethod.CASH
  );

  assert.strictEqual(result.payment.amount, 1000);
  assert.strictEqual(result.payment.paymentMethod, PaymentMethod.CASH);
  assert.strictEqual(result.payment.status, PaymentStatus.SUCCESS);
  assert.strictEqual(result.payment.invoiceId, "inv-1");
  assert.strictEqual(result.updatedInvoice.outstandingAmount, 0);
  assert.strictEqual(result.updatedInvoice.status, InvoiceStatus.PAID);
});

test("Process partial payment for invoice", () => {
  const invoice: Invoice = {
    id: "inv-1",
    invoiceNumber: "INV-001",
    invoiceDate: new Date(),
    items: [],
    totalAmount: 1000,
    totalTax: 70,
    outstandingAmount: 1000,
    status: InvoiceStatus.PENDING,
  };

  const result = PaymentService.processPayment(
    invoice,
    300,
    PaymentMethod.CASH
  );

  assert.strictEqual(result.payment.amount, 300);
  assert.strictEqual(result.updatedInvoice.outstandingAmount, 700);
  assert.strictEqual(result.updatedInvoice.status, InvoiceStatus.PENDING);
});

test("Process overpayment for invoice", () => {
  const invoice: Invoice = {
    id: "inv-1",
    invoiceNumber: "INV-001",
    invoiceDate: new Date(),
    items: [],
    totalAmount: 1000,
    totalTax: 70,
    outstandingAmount: 1000,
    status: InvoiceStatus.PENDING,
  };

  const result = PaymentService.processPayment(
    invoice,
    750,
    PaymentMethod.BANK_TRANSFER
  );

  assert.strictEqual(result.payment.amount, 750);
  assert.strictEqual(result.updatedInvoice.outstandingAmount, 250);
  assert.strictEqual(result.updatedInvoice.status, InvoiceStatus.PENDING);

  // Second payment causing overpayment
  const result2 = PaymentService.processPayment(
    result.updatedInvoice,
    300,
    PaymentMethod.BANK_TRANSFER
  );

  assert.strictEqual(result2.updatedInvoice.outstandingAmount, -50);
  assert.strictEqual(result2.updatedInvoice.status, InvoiceStatus.OVERPAID);
});

test("Payment service should throw error for zero payment amount", () => {
  const invoice: Invoice = {
    id: "inv-1",
    invoiceNumber: "INV-001",
    invoiceDate: new Date(),
    items: [],
    totalAmount: 100,
    totalTax: 10,
    outstandingAmount: 100,
    status: InvoiceStatus.PENDING,
  };

  assert.throws(
    () => PaymentService.processPayment(invoice, 0, PaymentMethod.CASH),
    { message: "Invalid payment amount" }
  );
});

test("Payment service should throw error for negative payment amount", () => {
  const invoice: Invoice = {
    id: "inv-1",
    invoiceNumber: "INV-001",
    invoiceDate: new Date(),
    items: [],
    totalAmount: 100,
    totalTax: 10,
    outstandingAmount: 100,
    status: InvoiceStatus.PENDING,
  };

  assert.throws(
    () => PaymentService.processPayment(invoice, -50, PaymentMethod.CASH),
    { message: "Invalid payment amount" }
  );
});

test("Multiple payments on same invoice", () => {
  const invoice: Invoice = {
    id: "inv-1",
    invoiceNumber: "INV-001",
    invoiceDate: new Date(),
    items: [],
    totalAmount: 200,
    totalTax: 20,
    outstandingAmount: 200,
    status: InvoiceStatus.PENDING,
  };

  const payment1 = PaymentService.processPayment(
    invoice,
    75,
    PaymentMethod.CASH
  );
  assert.strictEqual(payment1.updatedInvoice.outstandingAmount, 125);
  assert.strictEqual(payment1.updatedInvoice.status, InvoiceStatus.PENDING);

  const payment2 = PaymentService.processPayment(
    payment1.updatedInvoice,
    75,
    PaymentMethod.BANK_TRANSFER
  );
  assert.strictEqual(payment2.updatedInvoice.outstandingAmount, 50);
  assert.strictEqual(payment2.updatedInvoice.status, InvoiceStatus.PENDING);

  const payment3 = PaymentService.processPayment(
    payment2.updatedInvoice,
    50,
    PaymentMethod.CARD
  );
  assert.strictEqual(payment3.updatedInvoice.outstandingAmount, 0);
  assert.strictEqual(payment3.updatedInvoice.status, InvoiceStatus.PAID);
});

test("Payment generates unique IDs and reference numbers", () => {
  const invoice: Invoice = {
    id: "inv-1",
    invoiceNumber: "INV-001",
    invoiceDate: new Date(),
    items: [],
    totalAmount: 100,
    totalTax: 10,
    outstandingAmount: 100,
    status: InvoiceStatus.PENDING,
  };

  const result = PaymentService.processPayment(
    invoice,
    100,
    PaymentMethod.CASH
  );

  assert.ok(result.payment.id);
  assert.ok(result.payment.referenceNumber);
  assert.ok(result.payment.paymentDate instanceof Date);
});

test("Negative amounts in payments should throw error", () => {
  const invoice: Invoice = {
    id: "inv-1",
    invoiceNumber: "INV-001",
    invoiceDate: new Date(),
    items: [],
    totalAmount: 100,
    totalTax: 10,
    outstandingAmount: 100,
    status: InvoiceStatus.PENDING,
  };

  assert.throws(
    () => PaymentService.processPayment(invoice, -50, PaymentMethod.CASH),
    { message: "Invalid payment amount" },
    "Should reject negative payment amounts"
  );
});

test("Very large amounts should be handled correctly", () => {
  const items: InvoiceItem[] = [
    {
      id: "1",
      description: "Large Contract",
      quantity: 1,
      unitPrice: 999999.99,
      taxRate: 0.07,
      lineTotal: 0,
      taxAmount: 0,
    },
    {
      id: "2",
      description: "Additional Services",
      quantity: 5,
      unitPrice: 500000.5,
      taxRate: 0.07,
      lineTotal: 0,
      taxAmount: 0,
    },
  ];

  const total = InvoiceService.calculateInvoiceTotal(items, 0.07);

  assert.strictEqual(total.subtotal, 3500002.49);
  assert.strictEqual(total.tax, 245000.17);
  assert.strictEqual(total.total, 3745002.66);

  // Test payment processing with large amounts
  const invoice: Invoice = {
    id: "inv-1",
    invoiceNumber: "INV-001",
    invoiceDate: new Date(),
    items: items,
    totalAmount: total.total,
    totalTax: total.tax,
    outstandingAmount: total.total,
    status: InvoiceStatus.PENDING,
  };

  const result = PaymentService.processPayment(
    invoice,
    3745002.66,
    PaymentMethod.BANK_TRANSFER
  );

  assert.strictEqual(result.updatedInvoice.outstandingAmount, 0);
  assert.strictEqual(result.updatedInvoice.status, InvoiceStatus.PAID);
});

test("Multiple payments for same invoice", () => {
  const invoice: Invoice = {
    id: "inv-1",
    invoiceNumber: "INV-001",
    invoiceDate: new Date(),
    items: [],
    totalAmount: 1000,
    totalTax: 70,
    outstandingAmount: 1000,
    status: InvoiceStatus.PENDING,
  };

  // Payment 1: 25%
  const payment1 = PaymentService.processPayment(
    invoice,
    250,
    PaymentMethod.CASH
  );
  assert.strictEqual(payment1.updatedInvoice.outstandingAmount, 750);
  assert.strictEqual(payment1.updatedInvoice.status, InvoiceStatus.PENDING);

  // Payment 2: 25%
  const payment2 = PaymentService.processPayment(
    payment1.updatedInvoice,
    250,
    PaymentMethod.CARD
  );
  assert.strictEqual(payment2.updatedInvoice.outstandingAmount, 500);
  assert.strictEqual(payment2.updatedInvoice.status, InvoiceStatus.PENDING);

  // Payment 3: 25%
  const payment3 = PaymentService.processPayment(
    payment2.updatedInvoice,
    250,
    PaymentMethod.BANK_TRANSFER
  );
  assert.strictEqual(payment3.updatedInvoice.outstandingAmount, 250);
  assert.strictEqual(payment3.updatedInvoice.status, InvoiceStatus.PENDING);

  // Payment 4: 25%
  const payment4 = PaymentService.processPayment(
    payment3.updatedInvoice,
    250,
    PaymentMethod.CASH
  );
  assert.strictEqual(payment4.updatedInvoice.outstandingAmount, 0);
  assert.strictEqual(payment4.updatedInvoice.status, InvoiceStatus.PAID);

  // Verify each payment has unique IDs
  assert.notStrictEqual(payment1.payment.id, payment2.payment.id);
  assert.notStrictEqual(payment2.payment.id, payment3.payment.id);
  assert.notStrictEqual(payment3.payment.id, payment4.payment.id);
});
