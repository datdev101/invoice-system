import assert from "node:assert";
import test from "node:test";
import { InvoiceStatus, PaymentMethod } from "../../models/enum";
import { Invoice } from "../../models/invoice.model";
import { PaymentService } from "../payment.service";
import { ReceiptService } from "../receipt.service";

test("Generate receipt for payment", () => {
  const invoice: Invoice = {
    id: "inv-1",
    invoiceNumber: "INV-001",
    invoiceDate: new Date(),
    items: [
      {
        id: "1",
        description: "Service A",
        quantity: 1,
        unitPrice: 100,
        taxRate: 0.1,
        lineTotal: 100,
        taxAmount: 10,
      },
    ],
    totalAmount: 110,
    totalTax: 10,
    outstandingAmount: 110,
    status: InvoiceStatus.PENDING,
  };

  const paymentResult = PaymentService.processPayment(
    invoice,
    110,
    PaymentMethod.CASH
  );

  const receipt = ReceiptService.generateReceipt(
    paymentResult.payment,
    paymentResult.updatedInvoice
  );

  assert.strictEqual(receipt.paymentId, paymentResult.payment.id);
  assert.strictEqual(receipt.totalPaid, 110);
  assert.strictEqual(receipt.remainingBalance, 0);
  assert.strictEqual(receipt.items.length, 1);
  assert.strictEqual(receipt.items[0].description, "Service A");
  assert.strictEqual(receipt.items[0].amount, 110);
  assert.ok(receipt.id);
  assert.ok(receipt.receiptNumber);
  assert.ok(receipt.receiptDate instanceof Date);
});

test("Generate receipt for partial payment", () => {
  const invoice: Invoice = {
    id: "inv-1",
    invoiceNumber: "INV-001",
    invoiceDate: new Date(),
    items: [
      {
        id: "1",
        description: "Service A",
        quantity: 2,
        unitPrice: 50,
        taxRate: 0.1,
        lineTotal: 100,
        taxAmount: 10,
      },
    ],
    totalAmount: 110,
    totalTax: 10,
    outstandingAmount: 110,
    status: InvoiceStatus.PENDING,
  };

  const paymentResult = PaymentService.processPayment(
    invoice,
    55,
    PaymentMethod.BANK_TRANSFER
  );

  const receipt = ReceiptService.generateReceipt(
    paymentResult.payment,
    paymentResult.updatedInvoice
  );

  assert.strictEqual(receipt.totalPaid, 55);
  assert.strictEqual(receipt.remainingBalance, 55);
});

test("Receipt includes all invoice items", () => {
  const invoice: Invoice = {
    id: "inv-1",
    invoiceNumber: "INV-001",
    invoiceDate: new Date(),
    items: [
      {
        id: "1",
        description: "Item A",
        quantity: 2,
        unitPrice: 50,
        taxRate: 0.1,
        lineTotal: 100,
        taxAmount: 10,
      },
      {
        id: "2",
        description: "Item B",
        quantity: 1,
        unitPrice: 30,
        taxRate: 0.1,
        lineTotal: 30,
        taxAmount: 3,
      },
    ],
    totalAmount: 143,
    totalTax: 13,
    outstandingAmount: 143,
    status: InvoiceStatus.PENDING,
  };

  const paymentResult = PaymentService.processPayment(
    invoice,
    143,
    PaymentMethod.CARD
  );

  const receipt = ReceiptService.generateReceipt(
    paymentResult.payment,
    paymentResult.updatedInvoice
  );

  assert.strictEqual(receipt.items.length, 2);
  assert.strictEqual(receipt.items[0].description, "Item A");
  assert.strictEqual(receipt.items[0].amount, 110);
  assert.strictEqual(receipt.items[1].description, "Item B");
  assert.strictEqual(receipt.items[1].amount, 33);
});
