import { Invoice } from "../models/invoice.model";
import { Payment } from "../models/payment.model";
import { Receipt } from "../models/receipt.model";

export class ReceiptService {
  static generateReceipt(payment: Payment, invoice: Invoice): Receipt {
    return {
      id: crypto.randomUUID(),
      paymentId: payment.id,
      receiptNumber: Date.now().toString(),
      receiptDate: new Date(),
      totalPaid: payment.amount,
      remainingBalance: invoice.outstandingAmount,
      items: invoice.items.map((item) => ({
        id: item.id,
        description: item.description,
        amount: item.lineTotal + item.taxAmount,
      })),
    };
  }
}
