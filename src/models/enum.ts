enum InvoiceStatus {
  PENDING = "pending",
  PAID = "paid",
  OVERPAID = "overpaid",
}

enum PaymentMethod {
  CASH = "cash",
  BANK_TRANSFER = "bank_transfer",
  CARD = "card",
}

enum PaymentStatus {
  SUCCESS = "success",
  FAILED = "failed",
}

export { InvoiceStatus, PaymentMethod, PaymentStatus };
