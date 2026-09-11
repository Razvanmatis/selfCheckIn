import {WebhookReservation} from "./webhookReservation";
import {normalizePhone} from "../helper/validation";

export class DbReservationEntry {
    created_at: string;
    updated_at: string;
    smoobu_booking_id: number;
    firstname: string;
    lastname: string;
    phone?: string;
    arrival: string;
    departure: string;

    constructor(webhookReservation: WebhookReservation) {
        this.created_at = new Date().toISOString();
        this.updated_at = new Date().toISOString();
        this.smoobu_booking_id = webhookReservation.data.id;
        this.firstname = webhookReservation.data.firstname;
        this.lastname = webhookReservation.data.lastname;
        this.phone = normalizePhone(webhookReservation.data.phone);
        this.arrival = webhookReservation.data.arrival;
        this.departure = webhookReservation.data.departure;
    }
}