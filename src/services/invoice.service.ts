import { InvoiceItem, InvoiceTotals } from "../models/invoice.model";
import { roundToTwoDecimals } from "../utils/roundToTwoDecimals.util";

export class InvoiceService {
  static calculateInvoiceTotal(
    items: InvoiceItem[],
    taxRate: number
  ): InvoiceTotals {
    if (items.length === 0) {
      throw new Error("Invoice must contain at least one item");
    }
    if (taxRate < 0 || taxRate > 1) {
      throw new Error("Tax rate must be between 0 and 1");
    }

    let subtotal = 0;
    let tax = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.quantity <= 0) {
        throw new Error(
          `Invoice item id ${item.id}: Quantity must be greater than 0`
        );
      }
      if (item.unitPrice < 0) {
        throw new Error(
          `Invoice item id ${item.id}: Unit price cannot be negative`
        );
      }

      const lineTotal = item.quantity * item.unitPrice;
      const taxAmount = lineTotal * taxRate;

      subtotal += lineTotal;
      tax += taxAmount;

      item.lineTotal = lineTotal;
      item.taxAmount = taxAmount;
    }

    return {
      total: roundToTwoDecimals(subtotal + tax),
      tax: roundToTwoDecimals(tax),
      subtotal: roundToTwoDecimals(subtotal),
    };
  }
}
