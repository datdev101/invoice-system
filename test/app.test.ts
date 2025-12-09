import assert from "node:assert";
import test from "node:test";
import { InvoiceItem } from "../src/models/invoice.model";
import { InvoiceService } from "../src/services/invoice.service";

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

  assert(total.subtotal === 551.0, "Subtotal calculation");
  assert(total.tax === 38.57, "Tax calculation (7% GST)");
  assert(total.total === 589.57, "Total calculation");
});
