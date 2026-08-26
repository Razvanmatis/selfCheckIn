export type NukiAuthEntry = {
    id: string;
    smartlockId: number;
    authId: number;
    code: number;
    type: number;
    name: string;
    enabled: boolean;
    remoteAllowed: boolean;
    lockCount: number;
    allowedFromDate?: string;
    allowedUntilDate?: string;
    allowedWeekDays?: number;
    lastActiveDate?: string;
    creationDate?: string;
    updateDate?: string;
};