interface ReceiptItem {
  id: string;
}

interface Receipt {
  id: string;
  paymentId: string;
  receiptNumber: string;
  receiptDate: Date;
  totalPaid: number;
  remainingBalance: number;
  items: ReceiptItem[];
}

export { Receipt, ReceiptItem };
