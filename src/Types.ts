export interface User {
    userid: number;
    address: string;
    email: string;
    firstName: string;
    lastName: string;
    userType: UserType;
    username: string;
    user_security: UserSecurity
    user_date: UserDate
}

export interface UserSecurity {
    isVerified: boolean;
    isActive: boolean;
    failedLoginAttempts: number;
}

export interface UserDate {
    birthday: Date;
    joinDate: Date;
    tempLeaveStart: Date;
    tempLeaveEnd: Date;
}

export interface MessageResponse {
    message: string;
}

export interface Account {
    accountName: string;
    accountNumber: number;
    accountDescription: string;
    normalSide: AccountType;
    accountCategory: AccountCategory;
    accountSubCategory: AccountSubCategory;
    initialBalance: number;
    debitBalance: number;
    creditBalance: number;
    currentBalance: number;
    dateAdded: Date;
    username: string;
    isActive: boolean;
}

export interface TransactionForm {
    account: Account | undefined;
    transactionDate: Date;
    transactionDescription: string;
    transactionAmount: number;
    transactionType: AccountType;
    transactionId: number | undefined;
    pr: number | undefined;
}

export interface JournalEntry {
    transactions: TransactionForm[];
    user: User;
    comments: string;
    pr: number;
    isApproved: boolean | null;
}

export interface Email {
    to: string;
    from: string;
    date: string;
    subject: string;
    body: string;
    id: string;
    attachments?: Attachment[];
    isRead: boolean;
}

export interface Attachment {
    fileName: string;
    contentType: string;
    contentBase64: string;
}

export interface JournalEntryResponseDTO {
    messageResponse: MessageResponse;
    id: number;
}

export interface TrialBalanceDTO {
    accountName: string;
    debit: number;
    credit: number;
}

export interface BalanceSheetDTO {
    assets: Account[];
    liabilities: Account[];
    equity: Account[];
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
}

export interface RetainedEarningsRow {
    description: string;
    amount: number;
}

export interface RetainedEarningsDTO {
    rows: RetainedEarningsRow[];
}

export interface IncomeStatementDTO {
    revenue: Account[];
    expenses: Account[];
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
}

export interface GeneralMessageDTO {
    username: string;
    date: string;
    message: string;
}

export enum AccountType {
    DEBIT = "DEBIT",
    CREDIT = "CREDIT"
}

export enum AccountCategory {
    ASSET = "ASSET",
    LIABILITY = "LIABILITY",
    EQUITY = "EQUITY",
    REVENUE = "REVENUE",
    EXPENSE = "EXPENSE",
}

export enum AccountSubCategory {
    CURRENT = "CURRENT",
    LONGTERM = "LONGTERM",
    OWNERS = "OWNERS",
    SHAREHOLDERS = "SHAREHOLDERS",
    OPERATING = "OPERATING",
    NONOPERATING = "NONOPERATING"
}

export enum UserType {
    DEFAULT = "DEFAULT",
    ACCOUNTANT = "ACCOUNTANT",
    MANAGER = "MANAGER",
    ADMINISTRATOR = "ADMINISTRATOR"
}