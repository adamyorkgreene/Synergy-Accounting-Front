export interface User {
    userid: bigint;
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
    emailPassword: string;
    isVerified: boolean;
    isActive: boolean;
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

export interface Transaction {
    transactionId: number;
    transactionAccount: Account;
    transactionDate: Date;
    transactionDescription: string;
    transactionAmount: number;
    transactionType: AccountType;
}

export interface Email {
    to: string;
    from: string;
    date: string;
    subject: string;
    body: string;
    id: string;
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
    USER = "USER",
    ACCOUNTANT = "ACCOUNTANT",
    MANAGER = "MANAGER",
    ADMINISTRATOR = "ADMINISTRATOR"
}