# SIKOPET Backend API

REST API backend for SIKOPET (Koperasi Desa / Cooperative Management System).

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
npm run dev

# Run production server
npm start
```

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require JWT authentication.

**Header Format:**
```
Authorization: Bearer <access_token>
X-Device-Id: <device_uuid>
```

**Auth Flow:**
1. `POST /api/auth/login` → returns `accessToken` + `refreshToken`
2. Use `accessToken` in Authorization header
3. When expired, call `POST /api/auth/refresh`
4. Logout with `POST /api/auth/logout`

---

## Endpoints

### Health & Info

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Health check | No |
| GET | `/` | Root info | No |
| GET | `/api/info` | API info | No |

---

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login with email/password | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| POST | `/api/auth/logout` | Revoke tokens | Yes |
| POST | `/api/auth/device/register` | Register device for user | Yes |

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "cooperativeId": "uuid"
  }
}
```

---

### Sync Engine

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/sync/batch` | Process batch of offline mutations | Yes |
| GET | `/api/sync/status/:clientId` | Get sync status | Yes |
| GET | `/api/conflicts` | List conflict cases | Yes (BA/PMO) |
| POST | `/api/conflicts/:id/resolve` | Resolve conflict | Yes (BA/PMO) |

**Sync Batch Request:**
```json
{
  "items": [
    {
      "idempotencyKey": "uuid",
      "entityType": "Member",
      "operationType": "create",
      "clientId": "ulid",
      "payload": { "name": "John", "nik": "123456" },
      "deviceId": "uuid"
    }
  ]
}
```

**Sync Batch Response:**
```json
{
  "results": [
    {
      "idempotencyKey": "uuid",
      "status": "synced",
      "serverId": "uuid",
      "conflictType": null,
      "error": null
    }
  ]
}
```

---

### Cooperatives

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/cooperatives` | List cooperatives | Yes (PMO/Dinas) |
| GET | `/api/cooperatives/:id` | Get cooperative details | Yes |
| POST | `/api/cooperatives` | Create cooperative | Yes (admin) |

---

### Members

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/members` | List members | Yes |
| GET | `/api/members/:id` | Get member details | Yes |
| POST | `/api/members` | Create member | Yes |
| PUT | `/api/members/:id` | Update member | Yes |

---

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users` | List users | Yes |
| GET | `/api/users/:id` | Get user details | Yes |
| POST | `/api/users` | Create user | Yes (admin) |
| PUT | `/api/users/:id` | Update user | Yes (admin) |

---

### Savings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/savings/accounts` | List savings accounts | Yes |
| GET | `/api/savings/accounts/:memberId` | Get member's accounts | Yes |
| POST | `/api/savings/accounts` | Open new account | Yes |
| POST | `/api/savings/deposit` | Deposit (append-only) | Yes |
| POST | `/api/savings/withdraw` | Withdraw (append-only) | Yes |
| GET | `/api/savings/transactions/:accountId` | Transaction history | Yes |

**Deposit/Withdraw Request:**
```json
{
  "savingsAccountId": "uuid",
  "amount": 100000,
  "receiptNumber": "TXN-001",
  "description": "Monthly savings"
}
```

---

### Loans

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/loans` | List loans | Yes |
| GET | `/api/loans/:id` | Get loan with schedule | Yes |
| POST | `/api/loans` | Create loan (draft) | Yes |
| PUT | `/api/loans/:id` | Update loan | Yes |
| POST | `/api/loans/:id/submit` | Submit for approval | Yes |
| POST | `/api/loans/:id/approve` | Approve loan | Yes (BA) |
| POST | `/api/loans/:id/reject` | Reject loan | Yes (BA) |
| GET | `/api/loans/pending-approval` | Pending loans | Yes (BA) |
| GET | `/api/loans/overdue` | Overdue loans | Yes (PMO) |
| POST | `/api/loans/:id/disburse` | Disburse loan | Yes |
| GET | `/api/loans/:id/schedule` | Installment schedule | Yes |
| POST | `/api/loans/:loanId/payments` | Record payment | Yes |

**Create Loan Request:**
```json
{
  "memberId": "uuid",
  "principal": 10000000,
  "interestRate": 12,
  "tenorMonths": 12
}
```

**Loan Status Flow:**
```
draft → pending → approved → active → completed
                 ↘ rejected
```

---

### Deposits (Time Deposits)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/loans/deposits/list` | List time deposits | Yes |
| POST | `/api/loans/deposits` | Create time deposit | Yes |

---

### Products

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | List products | Yes |
| GET | `/api/products/:id` | Get product details | Yes |
| GET | `/api/products/barcode/:barcode` | Get by barcode | Yes |
| POST | `/api/products` | Create product | Yes |
| PUT | `/api/products/:id` | Update product | Yes |
| GET | `/api/products/low-stock` | Low stock alert | Yes |

---

### Suppliers

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/suppliers` | List suppliers | Yes |
| POST | `/api/suppliers` | Create supplier | Yes |

---

### Stock

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/stock` | List stock levels | Yes |
| GET | `/api/stock/:productId` | Stock for product | Yes |

---

### Sales

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/sales` | List sales | Yes |
| GET | `/api/sales/:id` | Get sale details | Yes |
| POST | `/api/sales` | Create sale | Yes |
| GET | `/api/sales/oversell` | Flagged sales | Yes (BA) |
| POST | `/api/sales/:id/resolve-oversell` | Resolve flagged | Yes (BA) |

---

### Purchases

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/purchases` | List purchases | Yes |
| POST | `/api/purchases` | Create purchase | Yes |

---

### Warehouses

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/warehouses` | List warehouses | Yes |
| GET | `/api/warehouses/:id` | Get warehouse | Yes |
| POST | `/api/warehouses` | Create warehouse | Yes |
| PUT | `/api/warehouses/:id` | Update warehouse | Yes |
| GET | `/api/warehouses/:id/stock` | Warehouse stock | Yes |

---

### Warehouse Rack Locations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/warehouse/racks` | List racks | Yes |
| POST | `/api/warehouse/racks` | Create rack | Yes |

---

### Goods Receipts

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/warehouse/receipts` | Record receipt | Yes |

---

### Warehouse Transfers

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/warehouse/transfers` | Record transfer (append-only) | Yes |

---

### Warehouse Mutations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/warehouse/mutations/:warehouseId` | Mutation history | Yes |

---

### Stock Opname

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/stock-opname` | List opnames | Yes |
| GET | `/api/stock-opname/:id` | Opname details | Yes |
| POST | `/api/stock-opname` | Create opname | Yes |
| POST | `/api/stock-opname/:id/submit` | Submit for review | Yes |
| POST | `/api/stock-opname/:id/approve` | Approve | Yes (BA) |
| POST | `/api/stock-opname/:id/reject` | Reject | Yes (BA) |

---

### Vehicles

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/vehicles` | List vehicles | Yes |
| POST | `/api/vehicles` | Create vehicle | Yes |
| PUT | `/api/vehicles/:id` | Update vehicle | Yes |

---

### Drivers

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/drivers` | List drivers | Yes |
| POST | `/api/drivers` | Create driver | Yes |
| PUT | `/api/drivers/:id` | Update driver | Yes |

---

### Deliveries

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/deliveries` | List schedules | Yes |
| GET | `/api/deliveries/:id` | Schedule details | Yes |
| POST | `/api/deliveries` | Create schedule | Yes |
| PUT | `/api/deliveries/:id` | Update schedule | Yes |
| POST | `/api/deliveries/:id/start` | Start delivery | Yes |
| POST | `/api/deliveries/:id/complete` | Complete delivery | Yes |
| POST | `/api/deliveries/:id/reschedule` | Reschedule | Yes |
| GET | `/api/deliveries/conflicts` | Schedule conflicts | Yes (BA/PMO) |
| POST | `/api/deliveries/:id/tracking` | Upload GPS position | Yes |
| POST | `/api/deliveries/:id/proof` | Upload proof of delivery | Yes |

---

### Legal - Profile

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/legal/profile` | Get cooperative profile | Yes |
| POST | `/api/legal/profile` | Create/update profile | Yes |

---

### Legal - Documents

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/legal/documents` | List documents | Yes |
| GET | `/api/legal/documents/:id` | Document details | Yes |
| POST | `/api/legal/documents` | Upload document | Yes |
| POST | `/api/legal/documents/:id/verify` | Submit for verification | Yes |

---

### Legal - Village Potentials

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/legal/village-potential` | List potentials | Yes |
| POST | `/api/legal/village-potential` | Create potential | Yes |

---

### Legal - Outlets

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/legal/outlets` | List outlets | Yes |
| POST | `/api/legal/outlets` | Create outlet | Yes |

---

### Legal - Financing Requests

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/legal/financing-requests` | List requests | Yes |
| POST | `/api/legal/financing-requests` | Create request | Yes |
| POST | `/api/legal/financing-requests/:id/submit` | Submit request | Yes |

---

### Legal - External Verification

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/legal/verifications/:type` | Trigger verification | Yes |

**Types:** `dukcapil_nik`, `humham_npak`, `pajak_djp`, `lahan_agrinas`

---

### Legal - Articles

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/legal/articles` | List articles | Yes |
| POST | `/api/legal/articles` | Create article | Yes |

---

### Public Microsite

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/public/microsite/:slug` | Public cooperative page | No |

---

### Dashboard

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/dashboard/summary` | Dashboard summary | Yes |
| GET | `/api/dashboard/pmo/koperasi` | PMO cooperative list | Yes (PMO) |
| GET | `/api/dashboard/ba/conflicts` | BA conflict inbox | Yes (BA) |
| GET | `/api/rules/latest` | Latest rule set | Yes |

---

### Notifications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/notifications` | List notifications | Yes |
| PUT | `/api/notifications/:id/read` | Mark as read | Yes |

---

### Settings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/settings` | Get all settings | Yes |
| GET | `/api/settings/:key` | Get setting | Yes |
| PUT | `/api/settings/:key` | Update setting | Yes (admin) |

---

## Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "path": "body.email", "message": "Invalid email format" }
    ]
  }
}
```

## Roles

| Role | Description |
|------|-------------|
| `admin` | Full access within cooperative |
| `operator` | Daily operations |
| `ba` | Branch manager - approvals |
| `pmo` | Project management office - cross-cooperative access |

## Status Values

**Cooperative:** `draft`, `verified`
**Member:** `active`, `inactive`
**Loan:** `draft`, `pending`, `approved`, `rejected`, `active`, `completed`, `overdue`
**Installment:** `unpaid`, `paid`, `late`
**Deposit:** `active`, `matured`, `withdrawn`
**Delivery:** `draft`, `scheduled`, `needs_reschedule`, `in_progress`, `delivered_pending_sync`, `delivered`
**Stock Opname:** `draft`, `pending_review`, `approved`, `rejected`
**Vehicle:** `active`, `maintenance`, `inactive`
**Document Verification:** `unverified`, `pending`, `verified`, `rejected`
**Financing Request:** `draft`, `submitted`, `in_review`, `approved`, `rejected`

## Environment Variables

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Server
NODE_ENV=development
PORT=3000
```
