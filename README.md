# Invoice Management System

A small TypeScript system for managing invoices, payments, and
receipts.\
Includes tax calculation, validation, and handling edge cases.

## Features

- Create invoices with automatic tax
- Process full or partial payments (cash, bank transfer, card)
- Generate receipts
- Validation for invalid input
- Handles overpayment and remaining balances

## Install

```bash
npm install
```

## Run

Run demo:

```bash
npm run start:dev
```

Run tests:

```bash
npm test
```

## Example

### Calculate Total

```ts
const totals = InvoiceService.calculateInvoiceTotal(items, 0.07);
// { subtotal, tax, total }
```

### Process Payment

```ts
const result = PaymentService.processPayment(
  invoice,
  589.57,
  PaymentMethod.CASH
);
// result.updatedInvoice.status => "paid"
```

### Generate Receipt

```ts
const receipt = ReceiptService.generateReceipt(
  result.payment,
  result.updatedInvoice
);
```

## Core Services

---

Service Purpose

---

InvoiceService Calculates totals (subtotal, tax,
total)

PaymentService Applies payments and changes
invoice status

ReceiptService Creates receipts with paid amount
and remaining balance

---

## Status & Methods

### Invoice Status

- PENDING
- PAID
- OVERPAID

### Payment Methods

- CASH, BANK_TRANSFER, CARD

## Design Notes

- All values are rounded to 2 decimals
- Each item stores its own total and tax
- Services return new objects (no mutation)
- Status changes automatically based on outstanding balance
