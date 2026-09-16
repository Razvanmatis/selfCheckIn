import {Env} from "../types/env";
import {DbReservationEntry} from "../types/dbReservationEntry";
import {getAllReservationsWithinNextFiveDays, markWhatsAppMessagesAsSent} from "../handler/dbHandler";
import {sendCheckInMessageToGuestByWhatsApp} from "../handler/whatsappHandler";

export async function informAllGuestsAboutCheckIn(env: Env) {
    const guestsToInform: DbReservationEntry[] = await getAllReservationsWithinNextFiveDays(env);
    for (const guest of guestsToInform) {
        if (guest.phone) {
            await sendCheckInMessageToGuestByWhatsApp(env, guest.phone);
        }
    }
    await markWhatsAppMessagesAsSent(env, guestsToInform);
}