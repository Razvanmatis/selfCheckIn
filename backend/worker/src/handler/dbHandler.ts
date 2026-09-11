import {WebhookReservation} from "../types/webhookReservation";
import {DbReservationEntry} from "../types/dbReservationEntry";
import {sendGeneralMessageToAdmin} from "../services/mailService";
import {Env} from "../types/env";
import {SmoobuReservationsResponse} from "../types/smoobuReservationsResponse";
import {getAllBookingsBySmoobu} from "./smoobuHandler";

export async function createReservation(
    env: Env,
    reservation: WebhookReservation
) {
    const dbReservationEntry: DbReservationEntry = new DbReservationEntry(reservation);
    const existingReservation = await env.DB.prepare(
        ` SELECT 1 
                FROM reservations 
                WHERE smoobu_booking_id = ? 
              LIMIT 1 `)
        .bind(dbReservationEntry.smoobu_booking_id)
        .first();
    if (existingReservation !== null) {
        await sendGeneralMessageToAdmin(`Die Reservierung mit der ID ${reservation.data.id} für ${reservation.data.firstname} ${reservation.data.lastname} konnte nicht erstellt werden, da sie bereits in der Datenbank existiert.`, env);
        return false;
    }
    dbReservationEntry.created_at = new Date().toISOString();
    dbReservationEntry.updated_at = new Date().toISOString();
    await env.DB
        .prepare(`
            INSERT INTO reservations (smoobu_booking_id, firstname, lastname, phone, arrival, departure, created_at,
                                      updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
            dbReservationEntry.smoobu_booking_id,
            dbReservationEntry.firstname,
            dbReservationEntry.lastname,
            dbReservationEntry.phone,
            dbReservationEntry.arrival,
            dbReservationEntry.departure,
            dbReservationEntry.created_at,
            dbReservationEntry.updated_at
        )
        .run();
    return true;
}

export async function updateReservation(
    env: Env,
    reservation: WebhookReservation
) {
    const dbReservationEntry: DbReservationEntry =
        new DbReservationEntry(reservation);
    dbReservationEntry.updated_at = new Date().toISOString();
    const result = await env.DB
        .prepare(`
            UPDATE reservations
            SET firstname  = ?,
                lastname   = ?,
                phone      = ?,
                arrival    = ?,
                departure  = ?,
                updated_at = ?
            WHERE smoobu_booking_id = ?
        `)
        .bind(
            dbReservationEntry.firstname,
            dbReservationEntry.lastname,
            dbReservationEntry.phone,
            dbReservationEntry.arrival,
            dbReservationEntry.departure,
            dbReservationEntry.updated_at,
            dbReservationEntry.smoobu_booking_id
        )
        .run();
    if (result.meta.changes === 0) {
        await sendGeneralMessageToAdmin(`Die Reservierung mit der ID ${reservation.data.id} für ${reservation.data.firstname} ${reservation.data.lastname} konnte nicht geändert werden, da sie nicht in der Datenbank gefunden wurde.`, env);
        return false;
    }
    return true;
}

export async function deleteReservation(
    env: Env,
    reservation: WebhookReservation
) {
    const dbReservationEntry: DbReservationEntry = new DbReservationEntry(reservation);
    const result = await env.DB .prepare(
        ` DELETE FROM reservations 
        WHERE smoobu_booking_id = ? `)
        .bind( dbReservationEntry.smoobu_booking_id, )
        .run();
    const entryDeleted = result.meta.changes > 0;
    if (!entryDeleted) {
        await sendGeneralMessageToAdmin(`Die Reservierung mit der ID ${reservation.data.id} für ${reservation.data.firstname} ${reservation.data.lastname} konnte nicht gelöscht werden, da sie nicht in der Datenbank gefunden wurde.`, env);
    }
    return entryDeleted;
}

export async function initWholeDatabase(env: Env) {
    try {
        const allBookings = await getAllBookingsBySmoobu(env);
        if (!allBookings) {
            throw new Error("Fehler beim Abrufen der Buchungen von Smoobu.");
        }
        for (const booking of allBookings.bookings) {
            const webhookReservation: WebhookReservation = {
                action: "newReservation",
                data: {
                    id: booking.id,
                    arrival: booking.arrival,
                    departure: booking.departure,
                    firstname: booking.firstname,
                    lastname: booking.lastname,
                    phone: booking.phone || ""
                }
            };
            await createReservation(env, webhookReservation);
        }
        await sendGeneralMessageToAdmin(`Die Datenbank wurde erfolgreich mit ${allBookings.bookings.length} Buchungen initialisiert.`, env, false);
    } catch (error) {
        console.error("Fehler beim Initialisieren der Datenbank:", error);
        throw new Error("Fehler beim Initialisieren der Datenbank: " + (error instanceof Error ? error.message : "Unbekannter Fehler"));
    }
}

export async function getAllReservationsFromDb(env: Env): Promise<SmoobuReservationsResponse> {
    const result = await env.DB
        .prepare(`
            SELECT id, arrival, departure, firstname, lastname, phone
            FROM reservations
        `)
        .all();
    return {
        bookings: result.results.map(row => ({
            id: +String(row.id),
            arrival: String(row.arrival),
            departure: String(row.departure),
            firstname: String(row.firstname),
            lastname: String(row.lastname),
            phone: row.phone ? String(row.phone) : ""
        }))
    };
}

export async function deleteExpiredReservations(env: Env): Promise<number> {
    const today = new Date().toISOString().split("T")[0];
    const result = await env.DB.prepare(
        ` DELETE FROM reservations 
        WHERE departure < ? 
        `)
        .bind(today)
        .run();
    const changes = result.meta.changes;
    await sendGeneralMessageToAdmin(`Es wurden ${changes} abgelaufene Reservierungen gelöscht.`, env, false);
    return changes;
}