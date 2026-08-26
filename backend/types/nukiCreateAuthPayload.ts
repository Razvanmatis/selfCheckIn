export type NukiCreateAuthPayload = {
    name: string;
    allowedFromDate: string;
    allowedUntilDate: string;
    allowedWeekDays: number;
    allowedFromTime: number;
    allowedUntilTime: number;
    accountUserId: number;
    smartlockIds: number[];
    remoteAllowed: boolean;
    smartActionsEnabled: boolean;
    type: number;
    code: number;
};