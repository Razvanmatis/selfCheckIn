export interface WebhookReservation {
    action: string;
    data: {
        id: number;
        arrival: string;
        departure: string;
        firstname: string;
        lastname: string;
        phone?: string;
    }
}