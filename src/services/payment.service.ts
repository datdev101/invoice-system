import { InvoiceStatus, PaymentMethod, PaymentStatus } from "../models/enum";
import { Invoice } from "../models/invoice.model";
import { Payment, PaymentResult } from "../models/payment.model";
import { roundToTwoDecimals } from "../utils/roundToTwoDecimals.util";

export class PaymentService {
  static processPayment(
    invoice: Invoice,
    paymentAmount: number,
    paymentMethod: PaymentMethod
  ): PaymentResult {
    if (paymentAmount <= 0) {
      throw new Error("Invalid payment amount");
    }

    const payment: Payment = {
      id: crypto.randomUUID(),
      invoiceId: invoice.id,
      amount: paymentAmount,
      paymentMethod,
      paymentDate: new Date(),
      referenceNumber: Date.now().toString(),
      status: PaymentStatus.SUCCESS,
    };

    invoice.outstandingAmount = roundToTwoDecimals(
      invoice.outstandingAmount - paymentAmount
    );

    if (invoice.outstandingAmount === 0) {
      invoice.status = InvoiceStatus.PAID;
    } else if (invoice.outstandingAmount < 0) {
      invoice.status = InvoiceStatus.OVERPAID;
    }

    return {
      payment,
      updatedInvoice: invoice,
    };
  }
}
