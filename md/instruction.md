# SIKOPET Backend — Node.js Backend Prompt

## Overview

Build a **Node.js REST API backend** with **cloud/sync database** for SIKOPET (Koperasi Desa / Cooperative Management System). The backend handles all transactional data for a multi-tenant cooperative system with offline-first PWA clients.

---

## 1. Technology Stack

### Core
- **Runtime**: Node.js 20+ (ES Modules)
- **Framework**: Express.js or Fastify
- **Database**: PostgreSQL (cloud-hosted) with Prisma ORM
- **Authentication**: JWT (access + refresh token) with device binding
- **Validation**: Zod
- **Error Handling**: Custom error classes with centralized handler

### Optional but Recommended
- **Rate Limiting**: `@fastify/rate-limit`
- **Logging**: Pino
- **File Storage**: S3-compatible (Cloudflare R2 / AWS S3) for documents/photos
- **Queue**: BullMQ + Redis for async jobs (notifications, external API calls)
- **API Documentation**: OpenAPI/Swagger

---

## 2. Data Models

### 2.1 Identity & Tenancy

```
User {
  id, email, passwordHash, name, role (admin|operator|ba|pmo),
  cooperativeId (FK), deviceId (nullable), createdAt, updatedAt, deletedAt
}

Cooperative {
  id, name, address, phone, NIB, SKAHU, status (draft|verified),
  modalSimpananPokok, modalSimpananWajib, createdAt, updatedAt
}

Member (Anggota) {
  id, cooperativeId (FK), memberNumber, nik, name, phone, address,
  status (active|inactive), joinDate, createdAt, updatedAt, deletedAt
}

Device {
  id, userId (FK), deviceId (UUID), platform, lastSeenAt
}
```

### 2.2 Simpan Pinjam (Savings & Loans)

```
SavingsAccount (RekeningSimpanan) {
  id, memberId (FK), type (pokok|wajib|sukarela), openedAt,
  status (active|closed), createdAt, updatedAt
}

SavingsMutation (MutasiSimpanan) {
  id, savingsAccountId (FK), type (deposit|withdrawal), amount,
  receiptNumber (unique per cooperative), description, officerId (FK),
  transactionDate, createdAt
  -- LEDGER: append-only, no update/delete
}

Loan (Pinjaman) {
  id, memberId (FK), principal, interestRate, tenorMonths,
  disbursementDate (nullable), status (draft|pending|approved|rejected|active|completed|overdue),
  approvedBy (FK nullable), approvedAt (nullable), notes (nullable),
  createdAt, updatedAt
}

InstallmentSchedule (JadwalAngsuran) {
  id, loanId (FK), installmentNumber, dueDate, amountDue,
  amountPaid (default 0), status (unpaid|paid|late),
  createdAt, updatedAt
}

LoanPayment (PembayaranAngsuran) {
  id, installmentScheduleId (FK), amount, paymentDate,
  officerId (FK), receiptNumber, createdAt
  -- LEDGER: append-only
}

Deposit (Deposito) {
  id, memberId (FK), principal, tenorMonths, interestRate,
  startDate, maturityDate, status (active|matured|withdrawn),
  createdAt, updatedAt
}
```

### 2.3 POS & Inventory

```
Product (Barang) {
  id, cooperativeId (FK), category, name, unit, purchasePrice,
  salePrice, barcode (unique nullable), minimumStock, createdAt, updatedAt, deletedAt
}

Supplier (Supplier) {
  id, cooperativeId (FK), name, contact, address, createdAt, updatedAt, deletedAt
}

Stock (StokBarang) {
  id, productId (FK), location, quantity, lastUpdated
  -- Computed projection, not source of truth
}

Purchase (PembelianBarang) {
  id, cooperativeId (FK), supplierId (FK), date, totalAmount,
  paymentStatus (unpaid|partial|paid), createdAt, updatedAt
}

PurchaseItem {
  id, purchaseId (FK), productId (FK), quantity, unitPrice, subtotal
}

Sale (PenjualanPOS) {
  id, cooperativeId (FK), cashierId (FK), date, totalAmount,
  paymentMethod (cash|card|transfer), status (completed|synced|flagged|resolved),
  createdAt, updatedAt
}

SaleItem {
  id, saleId (FK), productId (FK), quantity, unitPrice, subtotal
}
```

### 2.4 Gudang (Warehouse)

```
Warehouse (Gudang) {
  id, cooperativeId (FK), name, location, capacity, createdAt, updatedAt, deletedAt
}

RackLocation (LokasiRak) {
  id, warehouseId (FK), rackCode (unique per warehouse), capacity
}

GoodsReceipt (PenerimaanBarang) {
  id, warehouseId (FK), productId (FK), quantity, photoUrl (nullable),
  receiptDate, createdAt, updatedAt
}

WarehouseMutation (MutasiGudang) {
  id, productId (FK), warehouseId (FK), type (in|out|transfer),
  destinationWarehouseId (FK nullable), quantity, mutationDate,
  referenceNumber, createdAt
  -- LEDGER: append-only
}

StockOpname {
  id, warehouseId (FK), date, officerId (FK), status (draft|pending_review|approved|rejected),
  createdAt, updatedAt
}

StockOpnameItem {
  id, stockOpnameId (FK), productId (FK), systemQuantity, physicalQuantity, difference
}
```

### 2.5 Logistik (Logistics)

```
Vehicle (Kendaraan) {
  id, cooperativeId (FK), plateNumber (unique), type, capacityKg,
  status (active|maintenance|inactive), createdAt, updatedAt, deletedAt
}

Driver (Sopir) {
  id, cooperativeId (FK), name, licenseNumber (unique), phone,
  status (active|inactive), createdAt, updatedAt, deletedAt
}

DeliverySchedule (JadwalPengiriman) {
  id, vehicleId (FK), driverId (FK), date, origin, destination,
  status (draft|scheduled|needs_reschedule|in_progress|delivered_pending_sync|delivered),
  createdAt, updatedAt
}

DeliveryItem {
  id, deliveryScheduleId (FK), productId (FK), quantity, reference (nullable)
}

Appointment {
  id, deliveryScheduleId (FK), destinationAddress, scheduledTime,
  recipientContact, status (scheduled|needs_reschedule|completed), createdAt, updatedAt
}

TrackingPosition {
  id, deliveryScheduleId (FK), latitude, longitude, timestamp
  -- No soft delete (high volume, rotated)
}

ProofOfDelivery (BuktiTerima) {
  id, deliveryScheduleId (FK), recipientName, signatureUrl,
  receivedAt, createdAt
}
```

### 2.6 Legalitas & Gov Integration

```
CooperativeProfile (ProfilKoperasi) {
  id, cooperativeId (FK), name, address, NIB (unique nullable), SKAHU (unique nullable),
  legalStatus, modalSimpananPokok, modalSimpananWajib,
  status (draft|verified), createdAt, updatedAt
}

LegalDocument (DokumenLegal) {
  id, cooperativeId (FK), type (akta|SKAHU|NPWP|berita_acara|NIB),
  fileUrl (nullable), verificationStatus (unverified|pending|verified|rejected),
  createdAt, updatedAt
}

VillagePotential (PotensiDesa) {
  id, cooperativeId (FK), commodity, areaSize, volume (nullable),
  laborCount (nullable), estimatedValue (nullable), createdAt, updatedAt
}

Outlet (GeraiOutlet) {
  id, cooperativeId (FK), name, location, status (active|inactive),
  photo (nullable), createdAt, updatedAt
}

FinancingRequest (PermohonanPembiayaan) {
  id, cooperativeId (FK), type (bank_account|business_proposal|financing),
  status (draft|submitted|in_review|approved|rejected),
  submittedAt (nullable), createdAt, updatedAt
}

ExternalVerification (VerifikasiEksternal) {
  id, cooperativeId (FK), type (dukcapil_nik|humham_npak|pajak_djp|lahan_agrinas),
  status (pending|verified|rejected), verifiedAt (nullable),
  referenceResponse (JSON nullable), createdAt, updatedAt
}

Article (ArtikelKoperasi) {
  id, cooperativeId (FK), title, content, publishedAt (nullable),
  createdAt, updatedAt
}
```

### 2.7 Cross-Cutting

```
Outbox {
  id, deviceId, entityType, operationType (create|update|delete),
  clientId (ULID), payload (JSON), idempotencyKey (unique),
  status (pending|sent|synced|rejected|conflict),
  attemptCount, lastError (nullable), createdAt
}

IdempotencyLedger {
  idempotencyKey (PK), processedAt, resultStatus
}

ConflictCase {
  id, conflictType (oversell|vehicle_overlap|opname_variance),
  entityRefs (JSON), status (open|resolved),
  resolution (nullable), resolvedBy (FK nullable), resolvedAt (nullable),
  createdAt
}

Notification {
  id, cooperativeId (FK nullable), recipientRole, type (info|warning|error|success),
  payload (JSON), readAt (nullable), createdAt
}

ActivityLog {
  id, actorId (FK), actorRole, entityType, entityId,
  action (create|update|delete), beforeValue (JSON nullable),
  afterValue (JSON nullable), timestamp
}

RuleSet {
  id, ruleId, condition (JSON), action (JSON), version, module,
  createdAt
}

Setting {
  id, key (unique), value (JSON)
}
```

---

## 3. Required Endpoints

### 3.1 Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login with email/password | No |
| POST | `/api/auth/refresh` | Refresh access token | Refresh Token |
| POST | `/api/auth/logout` | Revoke tokens | Yes |
| POST | `/api/auth/device/register` | Register device for user | Yes |

### 3.2 Sync Engine

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/sync/batch` | Process batch of offline mutations | Yes |
| GET | `/api/sync/status/:clientId` | Get sync status for client record | Yes |
| GET | `/api/conflicts` | List all conflict cases | Yes (BA/PMO) |
| POST | `/api/conflicts/:id/resolve` | Resolve a conflict case | Yes (BA/PMO) |

### 3.3 Identity & Tenancy

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/cooperatives` | List cooperatives (PMO/Dinas only) | Yes |
| GET | `/api/cooperatives/:id` | Get cooperative details | Yes |
| POST | `/api/cooperatives` | Create cooperative | Yes (admin) |
| GET | `/api/members` | List members | Yes |
| GET | `/api/members/:id` | Get member details | Yes |
| POST | `/api/members` | Create member | Yes |
| PUT | `/api/members/:id` | Update member | Yes |
| GET | `/api/users` | List users | Yes |
| POST | `/api/users` | Create user | Yes (admin) |
| PUT | `/api/users/:id` | Update user | Yes (admin) |

### 3.4 Simpan Pinjam (Savings & Loans)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/savings/accounts` | List savings accounts | Yes |
| GET | `/api/savings/accounts/:memberId` | Get member's savings accounts | Yes |
| POST | `/api/savings/accounts` | Open new savings account | Yes |
| POST | `/api/savings/deposit` | Deposit to savings (append-only) | Yes |
| POST | `/api/savings/withdraw` | Withdraw from savings (append-only) | Yes |
| GET | `/api/savings/transactions/:accountId` | Get account transaction history | Yes |
| GET | `/api/loans` | List loans | Yes |
| GET | `/api/loans/:id` | Get loan details with schedule | Yes |
| POST | `/api/loans` | Create loan application (draft) | Yes |
| PUT | `/api/loans/:id` | Update loan | Yes |
| POST | `/api/loans/:id/submit` | Submit for approval | Yes |
| POST | `/api/loans/:id/approve` | Approve loan (BA only, online required) | Yes (BA) |
| POST | `/api/loans/:id/reject` | Reject loan (BA only, online required) | Yes (BA) |
| GET | `/api/loans/pending-approval` | List pending approval loans | Yes (BA) |
| GET | `/api/loans/overdue` | List overdue loans | Yes (PMO) |
| POST | `/api/loans/:id/disburse` | Disburse approved loan | Yes |
| GET | `/api/loans/:id/schedule` | Get installment schedule | Yes |
| POST | `/api/loans/:loanId/payments` | Record payment (append-only) | Yes |
| GET | `/api/deposits` | List time deposits | Yes |
| POST | `/api/deposits` | Create time deposit | Yes |

### 3.5 POS & Inventory

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | List products | Yes |
| GET | `/api/products/:id` | Get product details | Yes |
| POST | `/api/products` | Create product (online required) | Yes |
| PUT | `/api/products/:id` | Update product | Yes |
| GET | `/api/products/barcode/:barcode` | Get product by barcode | Yes |
| GET | `/api/products/low-stock` | List low stock products | Yes |
| GET | `/api/suppliers` | List suppliers | Yes |
| POST | `/api/suppliers` | Create supplier | Yes |
| GET | `/api/stock` | Get stock levels | Yes |
| GET | `/api/stock/:productId` | Get stock for product | Yes |
| GET | `/api/sales` | List sales | Yes |
| GET | `/api/sales/:id` | Get sale details | Yes |
| POST | `/api/sales` | Create sale | Yes |
| GET | `/api/sales/oversell` | List oversell flagged sales | Yes (BA) |
| POST | `/api/sales/:id/resolve-oversell` | Resolve oversell | Yes (BA) |
| GET | `/api/purchases` | List purchases | Yes |
| POST | `/api/purchases` | Create purchase | Yes |

### 3.6 Gudang (Warehouse)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/warehouses` | List warehouses | Yes |
| POST | `/api/warehouses` | Create warehouse | Yes |
| PUT | `/api/warehouses/:id` | Update warehouse | Yes |
| GET | `/api/warehouses/:id/stock` | Get warehouse stock | Yes |
| GET | `/api/warehouse/racks` | List rack locations | Yes |
| POST | `/api/warehouse/racks` | Create rack location | Yes |
| POST | `/api/warehouse/receipts` | Record goods receipt | Yes |
| POST | `/api/warehouse/transfers` | Record stock transfer (append-only) | Yes |
| GET | `/api/warehouse/mutations/:warehouseId` | Get mutation history | Yes |
| GET | `/api/stock-opname` | List stock opnames | Yes |
| GET | `/api/stock-opname/:id` | Get stock opname details | Yes |
| POST | `/api/stock-opname` | Create stock opname | Yes |
| POST | `/api/stock-opname/:id/submit` | Submit for review | Yes |
| POST | `/api/stock-opname/:id/approve` | Approve opname (BA only) | Yes (BA) |
| POST | `/api/stock-opname/:id/reject` | Reject opname (BA only) | Yes (BA) |

### 3.7 Logistik (Logistics)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/vehicles` | List vehicles | Yes |
| POST | `/api/vehicles` | Create vehicle | Yes |
| PUT | `/api/vehicles/:id` | Update vehicle | Yes |
| GET | `/api/drivers` | List drivers | Yes |
| POST | `/api/drivers` | Create driver | Yes |
| PUT | `/api/drivers/:id` | Update driver | Yes |
| GET | `/api/deliveries` | List delivery schedules | Yes |
| GET | `/api/deliveries/:id` | Get delivery details | Yes |
| POST | `/api/deliveries` | Create delivery schedule | Yes |
| PUT | `/api/deliveries/:id` | Update delivery schedule | Yes |
| POST | `/api/deliveries/:id/start` | Start delivery | Yes |
| POST | `/api/deliveries/:id/complete` | Complete delivery | Yes |
| POST | `/api/deliveries/:id/reschedule` | Reschedule delivery | Yes |
| GET | `/api/deliveries/conflicts` | List schedule conflicts | Yes (BA/PMO) |
| POST | `/api/deliveries/:id/tracking` | Upload tracking positions | Yes |
| POST | `/api/deliveries/:id/proof` | Upload proof of delivery | Yes |

### 3.8 Legalitas & Gov Integration

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/legal/profile` | Get cooperative profile | Yes |
| POST | `/api/legal/profile` | Create/update profile (draft) | Yes |
| GET | `/api/legal/documents` | List legal documents | Yes |
| POST | `/api/legal/documents` | Upload legal document | Yes |
| GET | `/api/legal/documents/:id` | Get document details | Yes |
| POST | `/api/legal/documents/:id/verify` | Submit for verification | Yes |
| GET | `/api/legal/village-potential` | List village potentials | Yes |
| POST | `/api/legal/village-potential` | Create village potential | Yes |
| GET | `/api/legal/outlets` | List outlets | Yes |
| POST | `/api/legal/outlets` | Create outlet | Yes |
| GET | `/api/legal/financing-requests` | List financing requests | Yes |
| POST | `/api/legal/financing-requests` | Create financing request | Yes |
| POST | `/api/legal/financing-requests/:id/submit` | Submit request | Yes |
| POST | `/api/legal/verifications/:type` | Trigger external verification | Yes |
| GET | `/api/legal/articles` | List articles | Yes |
| POST | `/api/legal/articles` | Create article | Yes |
| GET | `/api/public/microsite/:slug` | Public microsite (no auth) | No |

### 3.9 Dashboard & Reporting

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/dashboard/summary` | Dashboard summary | Yes |
| GET | `/api/dashboard/pmo/koperasi` | PMO cooperative list | Yes (PMO) |
| GET | `/api/dashboard/ba/conflicts` | BA conflict inbox | Yes (BA) |
| GET | `/api/rules/latest` | Get latest rule set | Yes |
| GET | `/api/notifications` | Get notifications | Yes |
| PUT | `/api/notifications/:id/read` | Mark notification read | Yes |

### 3.10 Settings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/settings` | Get all settings | Yes |
| GET | `/api/settings/:key` | Get setting by key | Yes |
| PUT | `/api/settings/:key` | Update setting | Yes (admin) |

---

## 4. Key Business Rules

### 4.1 Financial Ledger Rules
- `MutasiSimpanan`, `PembayaranAngsuran`, `MutasiGudang` are **append-only**
- No UPDATE/DELETE allowed on ledger tables (enforced at DB level with triggers)
- Balance is computed via SUM aggregation, never stored blindly

### 4.2 Loan Approval State Machine
```
draft → pending → approved → disbursed
                ↘ rejected
```
- Approval/rejection must be **online + role BA**
- On approval: generate `JadwalAngsuran` rows automatically

### 4.3 Sync Rules
- Every mutation goes through outbox with idempotency key
- Duplicate idempotency key = return cached result (no duplicate processing)
- Financial ledger items are never rejected for conflict, only flagged

### 4.4 Multi-tenancy
- All tenant-scoped queries automatically filter by `cooperativeId`
- PMO/Dinas roles can see cross-tenant data
- Device ID tracked on every record for audit

---

## 5. Essential Implementation Points

### 5.1 Project Structure
```
src/
├── app.js                  # Express/Fastify app entry
├── server.js               # Server bootstrap
├── config/
│   └── index.js            # Environment config
├── routes/
│   ├── index.js             # Route aggregator
│   ├── auth.routes.js
│   ├── sync.routes.js
│   ├── savings.routes.js
│   ├── loans.routes.js
│   ├── products.routes.js
│   ├── warehouse.routes.js
│   ├── logistics.routes.js
│   └── legal.routes.js
├── controllers/
│   └── ...
├── services/
│   └── ...
├── repositories/
│   └── ...                  # Interface-based, storage-agnostic
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── rbac.js              # Role-based access
│   ├── errorHandler.js
│   └── validate.js          # Zod validation
├── prisma/
│   └── schema.prisma
├── utils/
│   ├── errors.js            # Custom error classes
│   └── helpers.js
└── jobs/
    └── ...                  # BullMQ workers
```

### 5.2 Prisma Schema Essentials
- Use `@default(ulid())` for `id` fields
- Add `syncStatus`, `clientId`, `deviceId`, `syncedAt` to all models
- Add `deletedAt` (soft delete) to all non-ledger tables
- Ledger tables: no `@updatedAt`, no soft delete

### 5.3 Authentication Flow
1. Login → return `accessToken` (short-lived) + `refreshToken` (long-lived)
2. Every request → `Authorization: Bearer <accessToken>` + `X-Device-Id: <uuid>`
3. Access token expiry → client calls `/auth/refresh`
4. Refresh token expiry → force re-login

### 5.4 Sync Batch Contract
```json
POST /api/sync/batch
{
  "items": [
    {
      "idempotencyKey": "uuid",
      "entityType": "SavingsMutation",
      "operationType": "create",
      "clientId": "ulid",
      "payload": { ... },
      "deviceId": "uuid"
    }
  ]
}
```

Response:
```json
{
  "results": [
    {
      "idempotencyKey": "uuid",
      "status": "synced|conflict|rejected",
      "serverId": "ulid",
      "conflictType": null,
      "error": null
    }
  ]
}
```

### 5.5 Error Response Format
```json
{
  "error": {
    "code": "LOAN_ALREADY_APPROVED",
    "message": "Loan has already been approved",
    "details": { ... }
  }
}
```

### 5.6 Rate Limiting
- Auth endpoints: 5 requests/minute per IP
- Sync batch: 100 requests/minute per device
- Read endpoints: 1000 requests/minute per user

---

## 6. Testing Requirements

### 6.1 Unit Tests
- Service layer logic (loan approval state machine, balance calculation)
- Validation rules
- RBAC middleware

### 6.2 Integration Tests
- Full sync batch flow (create → sync → conflict detection)
- Authentication flow (login → refresh → logout)
- End-to-end ledger append (deposit → balance check)

### 6.3 Test Tools
- Vitest for unit/integration tests
- Supertest for HTTP assertions
- Prisma Test Utils for database setup

---

## 7. Performance Considerations

- Index on `(cooperativeId, deletedAt)` for all tenant tables
- Index on `(memberId, status)` for loans
- Index on `(loanId, installmentNumber)` for schedules
- Pagination on all list endpoints (default 20, max 100)
- Stock quantity is a **projection** computed from ledger, not updated directly

---

## 8. Security Checklist

- [ ] Passwords hashed with bcrypt (cost factor 12)
- [ ] JWT secret from environment variable
- [ ] RBAC checked on every protected route
- [ ] Input validation with Zod on all endpoints
- [ ] SQL injection prevented via Prisma parameterized queries
- [ ] Rate limiting on auth and sync endpoints
- [ ] Audit log for sensitive operations (approval, rejection)
- [ ] CORS configured for known origins only
- [ ] Helmet.js for security headers
