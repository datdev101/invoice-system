import assert from "node:assert";
import test from "node:test";
import { InvoiceItem } from "../../models/invoice.model";
import { InvoiceService } from "../invoice.service";

test("Basic Invoice Calculation", () => {
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
  const total = InvoiceService.calculateInvoiceTotal(items, 0.07);

  assert.strictEqual(total.subtotal, 551.0, "Subtotal should be 551.00");
  assert.strictEqual(total.tax, 38.57, "Tax should be 38.57 (7% GST)");
  assert.strictEqual(total.total, 589.57, "Total should be 589.57");
});

test("Invoice with zero tax rate", () => {
  const items: InvoiceItem[] = [
    {
      id: "1",
      description: "Service",
      quantity: 1,
      unitPrice: 100,
      taxRate: 0,
      lineTotal: 0,
      taxAmount: 0,
    },
  ];
  const total = InvoiceService.calculateInvoiceTotal(items, 0);

  assert.strictEqual(total.subtotal, 100);
  assert.strictEqual(total.tax, 0);
  assert.strictEqual(total.total, 100);
});

test("Invoice with multiple items of different quantities", () => {
  const items: InvoiceItem[] = [
    {
      id: "1",
      description: "Item A",
      quantity: 5,
      unitPrice: 10.5,
      taxRate: 0.1,
      lineTotal: 0,
      taxAmount: 0,
    },
    {
      id: "2",
      description: "Item B",
      quantity: 3,
      unitPrice: 20.75,
      taxRate: 0.1,
      lineTotal: 0,
      taxAmount: 0,
    },
  ];
  const total = InvoiceService.calculateInvoiceTotal(items, 0.1);

  assert.strictEqual(total.subtotal, 114.75);
  assert.strictEqual(total.tax, 11.48);
  assert.strictEqual(total.total, 126.23);
});

test("Invoice calculation should throw error for empty items", () => {
  assert.throws(() => InvoiceService.calculateInvoiceTotal([], 0.1), {
    message: "Invoice must contain at least one item",
  });
});

test("Invoice calculation should throw error for invalid tax rate", () => {
  const items: InvoiceItem[] = [
    {
      id: "1",
      description: "Item",
      quantity: 1,
      unitPrice: 100,
      taxRate: 0.1,
      lineTotal: 0,
      taxAmount: 0,
    },
  ];

  assert.throws(() => InvoiceService.calculateInvoiceTotal(items, 1.5), {
    message: "Tax rate must be between 0 and 1",
  });

  assert.throws(() => InvoiceService.calculateInvoiceTotal(items, -0.1), {
    message: "Tax rate must be between 0 and 1",
  });
});

test("Invoice calculation should throw error for invalid quantity", () => {
  const items: InvoiceItem[] = [
    {
      id: "1",
      description: "Item",
      quantity: 0,
      unitPrice: 100,
      taxRate: 0.1,
      lineTotal: 0,
      taxAmount: 0,
    },
  ];

  assert.throws(() => InvoiceService.calculateInvoiceTotal(items, 0.1), {
    message: "Invoice item id 1: Quantity must be greater than 0",
  });
});

test("Invoice calculation should throw error for negative unit price", () => {
  const items: InvoiceItem[] = [
    {
      id: "1",
      description: "Item",
      quantity: 1,
      unitPrice: -100,
      taxRate: 0.1,
      lineTotal: 0,
      taxAmount: 0,
    },
  ];

  assert.throws(() => InvoiceService.calculateInvoiceTotal(items, 0.1), {
    message: "Invoice item id 1: Unit price cannot be negative",
  });
});

test("Zero-amount invoices should throw error", () => {
  assert.throws(
    () => InvoiceService.calculateInvoiceTotal([], 0.1),
    { message: "Invoice must contain at least one item" },
    "Should reject empty invoice items"
  );
});

test("Negative unit prices should throw error", () => {
  const items: InvoiceItem[] = [
    {
      id: "1",
      description: "Item",
      quantity: 1,
      unitPrice: -100,
      taxRate: 0.1,
      lineTotal: 0,
      taxAmount: 0,
    },
  ];

  assert.throws(
    () => InvoiceService.calculateInvoiceTotal(items, 0.1),
    { message: "Invoice item id 1: Unit price cannot be negative" },
    "Should reject negative unit prices"
  );
});

test("Invoice with maximum allowed tax rate", () => {
  const items: InvoiceItem[] = [
    {
      id: "1",
      description: "Item",
      quantity: 1,
      unitPrice: 100,
      taxRate: 1.0,
      lineTotal: 0,
      taxAmount: 0,
    },
  ];

  const total = InvoiceService.calculateInvoiceTotal(items, 1.0);

  assert.strictEqual(total.subtotal, 100);
  assert.strictEqual(total.tax, 100);
  assert.strictEqual(total.total, 200);
});
