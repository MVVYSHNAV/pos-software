export const DOCTYPES = {
    // POS Core
    POS_PROFILE: "POS Profile",
    POS_OPENING_ENTRY: "POS Opening Entry",
    POS_CLOSING_ENTRY: "POS Closing Entry",

    // Sales
    SALES_INVOICE: "Sales Invoice",
    SALES_INVOICE_ITEM: "Sales Invoice Item",

    // Items
    ITEM: "Item",
    ITEM_GROUP: "Item Group",
    ITEM_PRICE: "Item Price",
    PRICE_LIST: "Price List",
    BIN: "Bin",

    // Payments
    MODE_OF_PAYMENT: "Mode of Payment",

    // Customers
    CUSTOMER: "Customer",
    CUSTOMER_GROUP: "Customer Group",
    TERRITORY: "Territory",

    // Company & Warehouse
    COMPANY: "Company",
    WAREHOUSE: "Warehouse",
    CURRENCY: "Currency",

    // User
    USER: "User",
} as const

export type DoctypeName = typeof DOCTYPES[keyof typeof DOCTYPES]
