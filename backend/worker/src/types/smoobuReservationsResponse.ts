import {SmoobuBooking} from "./smoobuBooking.js";

export type SmoobuReservationsResponse = {
    page_count?: number;
    page_size?: number;
    total_items?: number;
    page?: number;
    bookings: SmoobuBooking[];
};