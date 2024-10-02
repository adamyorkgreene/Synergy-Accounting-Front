export interface User {
    userid: bigint;
    userType: UserType;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    birthday: Date;
    address: string;
    verificationCode: string;
    isVerified: boolean;
    isActive: boolean;
    joinDate: Date;
    failedLoginAttempts: number;
    tempLeaveStart: Date;
    tempLeaveEnd: Date;
}

export interface MessageResponse {
    message: string;
}

export enum UserType {
    DEFAULT = "DEFAULT",
    USER = "USER",
    MANAGER = "MANAGER",
    ADMINISTRATOR = "ADMINISTRATOR"
}