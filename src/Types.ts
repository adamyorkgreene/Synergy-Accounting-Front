export interface User {
    userid: bigint;
    username: string;
    email: string;
    verificationCode: string;
    isVerified: boolean;
}