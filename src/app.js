import express from "express";
import cors from "cors";
import helmet from "helmet";
import config from "./config/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        name: "SIKOPET API",
        version: "1.0.0",
        description: "Cooperative Management System Backend",
        documentation: "/api/docs",
    });
});

// API Info endpoint
app.get("/api/info", (req, res) => {
    res.json({
        name: "SIKOPET API",
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
    });
});

// API Documentation endpoint
app.get("/api/docs", (req, res) => {
    res.json({
        name: "SIKOPET API Documentation",
        version: "1.0.0",
        baseUrl: "/api",
        authentication: {
            method: "JWT Bearer Token",
            header: "Authorization: Bearer <access_token>",
            deviceHeader: "X-Device-Id: <device_uuid>",
            flow: [
                "POST /auth/login → returns accessToken + refreshToken",
                "Use accessToken in Authorization header",
                "POST /auth/refresh when accessToken expires",
                "POST /auth/logout to revoke",
            ],
        },
        roles: {
            admin: "Full access within cooperative",
            operator: "Daily operations",
            ba: "Branch manager - approvals",
            pmo: "Project management office - cross-cooperative access",
        },
        endpoints: {
            "Health & Info": [
                {
                    method: "GET",
                    path: "/health",
                    auth: false,
                    description: "Health check",
                },
                {
                    method: "GET",
                    path: "/",
                    auth: false,
                    description: "Root info",
                },
                {
                    method: "GET",
                    path: "/api/info",
                    auth: false,
                    description: "API info",
                },
                {
                    method: "GET",
                    path: "/api/docs",
                    auth: false,
                    description: "This documentation",
                },
            ],
            Authentication: [
                {
                    method: "POST",
                    path: "/api/auth/login",
                    auth: false,
                    description: "Login with email/password",
                    body: { email: "string", password: "string" },
                },
                {
                    method: "POST",
                    path: "/api/auth/refresh",
                    auth: false,
                    description: "Refresh access token",
                    body: { refreshToken: "string" },
                },
                {
                    method: "POST",
                    path: "/api/auth/logout",
                    auth: true,
                    description: "Revoke tokens",
                },
                {
                    method: "POST",
                    path: "/api/auth/device/register",
                    auth: true,
                    description: "Register device",
                    body: { deviceId: "uuid", platform: "string?" },
                },
            ],
            "Sync Engine": [
                {
                    method: "POST",
                    path: "/api/sync/batch",
                    auth: true,
                    description: "Process batch of offline mutations",
                    body: { items: "array" },
                },
                {
                    method: "GET",
                    path: "/api/sync/status/:clientId",
                    auth: true,
                    description: "Get sync status",
                },
                {
                    method: "GET",
                    path: "/api/conflicts",
                    auth: "BA/PMO",
                    description: "List conflict cases",
                },
                {
                    method: "POST",
                    path: "/api/conflicts/:id/resolve",
                    auth: "BA/PMO",
                    description: "Resolve conflict",
                    body: { resolution: "string" },
                },
            ],
            Cooperatives: [
                {
                    method: "GET",
                    path: "/api/cooperatives",
                    auth: "PMO/Dinas",
                    description: "List cooperatives",
                },
                {
                    method: "GET",
                    path: "/api/cooperatives/:id",
                    auth: true,
                    description: "Get cooperative details",
                },
                {
                    method: "POST",
                    path: "/api/cooperatives",
                    auth: "admin",
                    description: "Create cooperative",
                    body: {
                        name: "string",
                        address: "string?",
                        phone: "string?",
                        NIB: "string?",
                        SKAHU: "string?",
                    },
                },
            ],
            Members: [
                {
                    method: "GET",
                    path: "/api/members",
                    auth: true,
                    description: "List members",
                },
                {
                    method: "GET",
                    path: "/api/members/:id",
                    auth: true,
                    description: "Get member details",
                },
                {
                    method: "POST",
                    path: "/api/members",
                    auth: true,
                    description: "Create member",
                    body: {
                        memberNumber: "string",
                        nik: "string",
                        name: "string",
                        phone: "string?",
                        address: "string?",
                    },
                },
                {
                    method: "PUT",
                    path: "/api/members/:id",
                    auth: true,
                    description: "Update member",
                },
            ],
            Users: [
                {
                    method: "GET",
                    path: "/api/users",
                    auth: true,
                    description: "List users",
                },
                {
                    method: "GET",
                    path: "/api/users/:id",
                    auth: true,
                    description: "Get user details",
                },
                {
                    method: "POST",
                    path: "/api/users",
                    auth: "admin",
                    description: "Create user",
                    body: {
                        email: "string",
                        password: "string",
                        name: "string",
                        role: "admin|operator|ba|pmo",
                    },
                },
                {
                    method: "PUT",
                    path: "/api/users/:id",
                    auth: "admin",
                    description: "Update user",
                },
            ],
            Savings: [
                {
                    method: "GET",
                    path: "/api/savings/accounts",
                    auth: true,
                    description: "List savings accounts",
                },
                {
                    method: "GET",
                    path: "/api/savings/accounts/:memberId",
                    auth: true,
                    description: "Get member's accounts",
                },
                {
                    method: "POST",
                    path: "/api/savings/accounts",
                    auth: true,
                    description: "Open new account",
                    body: { memberId: "uuid", type: "pokok|wajib|sukarela" },
                },
                {
                    method: "POST",
                    path: "/api/savings/deposit",
                    auth: true,
                    description: "Deposit (append-only)",
                    body: {
                        savingsAccountId: "uuid",
                        amount: "number",
                        receiptNumber: "string",
                        description: "string?",
                    },
                },
                {
                    method: "POST",
                    path: "/api/savings/withdraw",
                    auth: true,
                    description: "Withdraw (append-only)",
                    body: {
                        savingsAccountId: "uuid",
                        amount: "number",
                        receiptNumber: "string",
                        description: "string?",
                    },
                },
                {
                    method: "GET",
                    path: "/api/savings/transactions/:accountId",
                    auth: true,
                    description: "Transaction history",
                },
            ],
            Loans: [
                {
                    method: "GET",
                    path: "/api/loans",
                    auth: true,
                    description: "List loans",
                },
                {
                    method: "GET",
                    path: "/api/loans/:id",
                    auth: true,
                    description: "Get loan with schedule",
                },
                {
                    method: "POST",
                    path: "/api/loans",
                    auth: true,
                    description: "Create loan (draft)",
                    body: {
                        memberId: "uuid",
                        principal: "number",
                        interestRate: "number",
                        tenorMonths: "number",
                    },
                },
                {
                    method: "PUT",
                    path: "/api/loans/:id",
                    auth: true,
                    description: "Update loan",
                },
                {
                    method: "POST",
                    path: "/api/loans/:id/submit",
                    auth: true,
                    description: "Submit for approval",
                },
                {
                    method: "POST",
                    path: "/api/loans/:id/approve",
                    auth: "BA",
                    description: "Approve loan",
                    body: { notes: "string?" },
                },
                {
                    method: "POST",
                    path: "/api/loans/:id/reject",
                    auth: "BA",
                    description: "Reject loan",
                    body: { notes: "string" },
                },
                {
                    method: "GET",
                    path: "/api/loans/pending-approval",
                    auth: "BA",
                    description: "Pending loans",
                },
                {
                    method: "GET",
                    path: "/api/loans/overdue",
                    auth: "PMO",
                    description: "Overdue loans",
                },
                {
                    method: "POST",
                    path: "/api/loans/:id/disburse",
                    auth: true,
                    description: "Disburse loan",
                    body: { disbursementDate: "string?" },
                },
                {
                    method: "GET",
                    path: "/api/loans/:id/schedule",
                    auth: true,
                    description: "Installment schedule",
                },
                {
                    method: "POST",
                    path: "/api/loans/:loanId/payments",
                    auth: true,
                    description: "Record payment",
                    body: {
                        installmentScheduleId: "uuid",
                        amount: "number",
                        receiptNumber: "string",
                    },
                },
                {
                    method: "GET",
                    path: "/api/loans/deposits/list",
                    auth: true,
                    description: "List time deposits",
                },
                {
                    method: "POST",
                    path: "/api/loans/deposits",
                    auth: true,
                    description: "Create time deposit",
                    body: {
                        memberId: "uuid",
                        principal: "number",
                        tenorMonths: "number",
                        interestRate: "number",
                        maturityDate: "string",
                    },
                },
            ],
            Products: [
                {
                    method: "GET",
                    path: "/api/products",
                    auth: true,
                    description: "List products",
                },
                {
                    method: "GET",
                    path: "/api/products/:id",
                    auth: true,
                    description: "Get product details",
                },
                {
                    method: "GET",
                    path: "/api/products/barcode/:barcode",
                    auth: true,
                    description: "Get by barcode",
                },
                {
                    method: "POST",
                    path: "/api/products",
                    auth: true,
                    description: "Create product",
                },
                {
                    method: "PUT",
                    path: "/api/products/:id",
                    auth: true,
                    description: "Update product",
                },
                {
                    method: "GET",
                    path: "/api/products/low-stock",
                    auth: true,
                    description: "Low stock alert",
                },
            ],
            Suppliers: [
                {
                    method: "GET",
                    path: "/api/suppliers",
                    auth: true,
                    description: "List suppliers",
                },
                {
                    method: "POST",
                    path: "/api/suppliers",
                    auth: true,
                    description: "Create supplier",
                },
            ],
            Stock: [
                {
                    method: "GET",
                    path: "/api/stock",
                    auth: true,
                    description: "List stock levels",
                },
                {
                    method: "GET",
                    path: "/api/stock/:productId",
                    auth: true,
                    description: "Stock for product",
                },
            ],
            Sales: [
                {
                    method: "GET",
                    path: "/api/sales",
                    auth: true,
                    description: "List sales",
                },
                {
                    method: "GET",
                    path: "/api/sales/:id",
                    auth: true,
                    description: "Get sale details",
                },
                {
                    method: "POST",
                    path: "/api/sales",
                    auth: true,
                    description: "Create sale",
                    body: {
                        totalAmount: "number",
                        paymentMethod: "cash|card|transfer?",
                        items: "array",
                    },
                },
                {
                    method: "GET",
                    path: "/api/sales/oversell",
                    auth: "BA",
                    description: "Flagged sales",
                },
                {
                    method: "POST",
                    path: "/api/sales/:id/resolve-oversell",
                    auth: "BA",
                    description: "Resolve flagged sale",
                },
            ],
            Purchases: [
                {
                    method: "GET",
                    path: "/api/purchases",
                    auth: true,
                    description: "List purchases",
                },
                {
                    method: "POST",
                    path: "/api/purchases",
                    auth: true,
                    description: "Create purchase",
                },
            ],
            Warehouses: [
                {
                    method: "GET",
                    path: "/api/warehouses",
                    auth: true,
                    description: "List warehouses",
                },
                {
                    method: "GET",
                    path: "/api/warehouses/:id",
                    auth: true,
                    description: "Get warehouse",
                },
                {
                    method: "POST",
                    path: "/api/warehouses",
                    auth: true,
                    description: "Create warehouse",
                },
                {
                    method: "PUT",
                    path: "/api/warehouses/:id",
                    auth: true,
                    description: "Update warehouse",
                },
                {
                    method: "GET",
                    path: "/api/warehouses/:id/stock",
                    auth: true,
                    description: "Warehouse stock",
                },
            ],
            "Warehouse Racks": [
                {
                    method: "GET",
                    path: "/api/warehouse/racks",
                    auth: true,
                    description: "List racks",
                },
                {
                    method: "POST",
                    path: "/api/warehouse/racks",
                    auth: true,
                    description: "Create rack",
                },
            ],
            "Goods Receipts": [
                {
                    method: "POST",
                    path: "/api/warehouse/receipts",
                    auth: true,
                    description: "Record receipt",
                },
            ],
            "Warehouse Transfers": [
                {
                    method: "POST",
                    path: "/api/warehouse/transfers",
                    auth: true,
                    description: "Record transfer (append-only)",
                },
            ],
            "Warehouse Mutations": [
                {
                    method: "GET",
                    path: "/api/warehouse/mutations/:warehouseId",
                    auth: true,
                    description: "Mutation history",
                },
            ],
            "Stock Opname": [
                {
                    method: "GET",
                    path: "/api/stock-opname",
                    auth: true,
                    description: "List opnames",
                },
                {
                    method: "GET",
                    path: "/api/stock-opname/:id",
                    auth: true,
                    description: "Opname details",
                },
                {
                    method: "POST",
                    path: "/api/stock-opname",
                    auth: true,
                    description: "Create opname",
                },
                {
                    method: "POST",
                    path: "/api/stock-opname/:id/submit",
                    auth: true,
                    description: "Submit for review",
                },
                {
                    method: "POST",
                    path: "/api/stock-opname/:id/approve",
                    auth: "BA",
                    description: "Approve opname",
                },
                {
                    method: "POST",
                    path: "/api/stock-opname/:id/reject",
                    auth: "BA",
                    description: "Reject opname",
                },
            ],
            Vehicles: [
                {
                    method: "GET",
                    path: "/api/vehicles",
                    auth: true,
                    description: "List vehicles",
                },
                {
                    method: "POST",
                    path: "/api/vehicles",
                    auth: true,
                    description: "Create vehicle",
                },
                {
                    method: "PUT",
                    path: "/api/vehicles/:id",
                    auth: true,
                    description: "Update vehicle",
                },
            ],
            Drivers: [
                {
                    method: "GET",
                    path: "/api/drivers",
                    auth: true,
                    description: "List drivers",
                },
                {
                    method: "POST",
                    path: "/api/drivers",
                    auth: true,
                    description: "Create driver",
                },
                {
                    method: "PUT",
                    path: "/api/drivers/:id",
                    auth: true,
                    description: "Update driver",
                },
            ],
            Deliveries: [
                {
                    method: "GET",
                    path: "/api/deliveries",
                    auth: true,
                    description: "List schedules",
                },
                {
                    method: "GET",
                    path: "/api/deliveries/:id",
                    auth: true,
                    description: "Schedule details",
                },
                {
                    method: "POST",
                    path: "/api/deliveries",
                    auth: true,
                    description: "Create schedule",
                },
                {
                    method: "PUT",
                    path: "/api/deliveries/:id",
                    auth: true,
                    description: "Update schedule",
                },
                {
                    method: "POST",
                    path: "/api/deliveries/:id/start",
                    auth: true,
                    description: "Start delivery",
                },
                {
                    method: "POST",
                    path: "/api/deliveries/:id/complete",
                    auth: true,
                    description: "Complete delivery",
                },
                {
                    method: "POST",
                    path: "/api/deliveries/:id/reschedule",
                    auth: true,
                    description: "Reschedule",
                },
                {
                    method: "GET",
                    path: "/api/deliveries/conflicts",
                    auth: "BA/PMO",
                    description: "Schedule conflicts",
                },
                {
                    method: "POST",
                    path: "/api/deliveries/:id/tracking",
                    auth: true,
                    description: "Upload GPS position",
                    body: { latitude: "number", longitude: "number" },
                },
                {
                    method: "POST",
                    path: "/api/deliveries/:id/proof",
                    auth: true,
                    description: "Upload proof of delivery",
                    body: { recipientName: "string", signatureUrl: "string?" },
                },
            ],
            "Legal - Profile": [
                {
                    method: "GET",
                    path: "/api/legal/profile",
                    auth: true,
                    description: "Get cooperative profile",
                },
                {
                    method: "POST",
                    path: "/api/legal/profile",
                    auth: true,
                    description: "Create/update profile",
                },
            ],
            "Legal - Documents": [
                {
                    method: "GET",
                    path: "/api/legal/documents",
                    auth: true,
                    description: "List documents",
                },
                {
                    method: "GET",
                    path: "/api/legal/documents/:id",
                    auth: true,
                    description: "Document details",
                },
                {
                    method: "POST",
                    path: "/api/legal/documents",
                    auth: true,
                    description: "Upload document",
                },
                {
                    method: "POST",
                    path: "/api/legal/documents/:id/verify",
                    auth: true,
                    description: "Submit for verification",
                },
            ],
            "Legal - Village Potentials": [
                {
                    method: "GET",
                    path: "/api/legal/village-potential",
                    auth: true,
                    description: "List potentials",
                },
                {
                    method: "POST",
                    path: "/api/legal/village-potential",
                    auth: true,
                    description: "Create potential",
                },
            ],
            "Legal - Outlets": [
                {
                    method: "GET",
                    path: "/api/legal/outlets",
                    auth: true,
                    description: "List outlets",
                },
                {
                    method: "POST",
                    path: "/api/legal/outlets",
                    auth: true,
                    description: "Create outlet",
                },
            ],
            "Legal - Financing Requests": [
                {
                    method: "GET",
                    path: "/api/legal/financing-requests",
                    auth: true,
                    description: "List requests",
                },
                {
                    method: "POST",
                    path: "/api/legal/financing-requests",
                    auth: true,
                    description: "Create request",
                },
                {
                    method: "POST",
                    path: "/api/legal/financing-requests/:id/submit",
                    auth: true,
                    description: "Submit request",
                },
            ],
            "Legal - Verifications": [
                {
                    method: "POST",
                    path: "/api/legal/verifications/:type",
                    auth: true,
                    description: "Trigger verification",
                    params: {
                        type: "dukcapil_nik|humham_npak|pajak_djp|lahan_agrinas",
                    },
                },
            ],
            "Legal - Articles": [
                {
                    method: "GET",
                    path: "/api/legal/articles",
                    auth: true,
                    description: "List articles",
                },
                {
                    method: "POST",
                    path: "/api/legal/articles",
                    auth: true,
                    description: "Create article",
                },
            ],
            "Public Microsite": [
                {
                    method: "GET",
                    path: "/api/public/microsite/:slug",
                    auth: false,
                    description: "Public cooperative page",
                },
            ],
            Dashboard: [
                {
                    method: "GET",
                    path: "/api/dashboard/summary",
                    auth: true,
                    description: "Dashboard summary",
                },
                {
                    method: "GET",
                    path: "/api/dashboard/pmo/koperasi",
                    auth: "PMO",
                    description: "PMO cooperative list",
                },
                {
                    method: "GET",
                    path: "/api/dashboard/ba/conflicts",
                    auth: "BA",
                    description: "BA conflict inbox",
                },
                {
                    method: "GET",
                    path: "/api/rules/latest",
                    auth: true,
                    description: "Latest rule set",
                },
            ],
            Notifications: [
                {
                    method: "GET",
                    path: "/api/notifications",
                    auth: true,
                    description: "List notifications",
                },
                {
                    method: "PUT",
                    path: "/api/notifications/:id/read",
                    auth: true,
                    description: "Mark as read",
                },
            ],
            Settings: [
                {
                    method: "GET",
                    path: "/api/settings",
                    auth: true,
                    description: "Get all settings",
                },
                {
                    method: "GET",
                    path: "/api/settings/:key",
                    auth: true,
                    description: "Get setting",
                },
                {
                    method: "PUT",
                    path: "/api/settings/:key",
                    auth: "admin",
                    description: "Update setting",
                },
            ],
        },
        errorResponse: {
            format: {
                error: { code: "string", message: "string", details: "array?" },
            },
            codes: [
                "NOT_FOUND",
                "UNAUTHORIZED",
                "FORBIDDEN",
                "VALIDATION_ERROR",
                "CONFLICT",
                "LEDGER_ERROR",
                "INTERNAL_ERROR",
            ],
        },
        statusValues: {
            cooperative: "draft | verified",
            member: "active | inactive",
            loan: "draft | pending | approved | rejected | active | completed | overdue",
            installment: "unpaid | paid | late",
            deposit: "active | matured | withdrawn",
            delivery:
                "draft | scheduled | needs_reschedule | in_progress | delivered_pending_sync | delivered",
            stockOpname: "draft | pending_review | approved | rejected",
            vehicle: "active | maintenance | inactive",
            documentVerification: "unverified | pending | verified | rejected",
            financingRequest:
                "draft | submitted | in_review | approved | rejected",
        },
        loanStatusFlow:
            "draft → pending → approved → active → completed | rejected",
    });
});

// API routes
app.use("/api", routes);

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: {
            code: "NOT_FOUND",
            message: `Route ${req.method} ${req.path} not found`,
        },
    });
});

export default app;
