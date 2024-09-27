export interface User {
    userid: bigint;
    userType: UserType;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    birthday: number;
    birthMonth: number;
    birthYear: number;
    address: string;
    verificationCode: string;
    isVerified: boolean;
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