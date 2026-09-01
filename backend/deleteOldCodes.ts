import type {Env} from "./env.js";
import {sendGeneralMessageToAdmin} from "./mailService.js";
import {createKeypadCode, deleteKeypadCode, forceNukiSync, getAllKeypadCodes} from "./defineKeypadCode.js";
import {getAllOpenBookings} from "./initiateCheckInProcess.js";
import {SmoobuBooking} from "./types/smoobuBooking.js";
import {NukiCreateAuthPayload} from "./types/nukiCreateAuthPayload.js";
import {formatDateToDayMonth} from "./validation.js";

type LambdaLikeEvent = {
    body: string | null;
};

type LambdaLikeResponse = {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
};

type BookingMatchEntry = {
    arrivalDate: string,
    departureDate: string,
    nameInitials: string
}

const jsonHeaders = {
    "Content-Type": "application/json"
};

const textHeaders = {
    "Content-Type": "text/plain; charset=utf-8"
};

function validateDeleteOldCodesRequest(body: string | null, env: Env) {
    return body !== null && body.trim() === env.ADMIN_NAME;
}

function getFormattedDate(dateString: string, olderDate: string | undefined = undefined) {
    let fullYear = new Date().getFullYear();
    if (olderDate && Number(dateString.substring(3)) < Number(olderDate.substring(3))) {
        fullYear++;
    }
    return fullYear + "-" + dateString.substring(3) + "-" + dateString.substring(0, 2);
}

function codeIsInBookingListMatchingAllCriteria(arrivalDate: string, departureDate: string, nameInitials: string, allActiveBookings: SmoobuBooking[]) {
    return allActiveBookings.find(entry => entry.arrival === arrivalDate && entry.departure === departureDate
        && entry.firstname.charAt(0).toLowerCase() === nameInitials.charAt(0).toLowerCase()
        && entry.lastname.charAt(0).toLowerCase() === nameInitials.charAt(1).toLowerCase()) !== undefined;
}

function getEntryOfBookingListInTimespan(arrivalDate: string, departureDate: string, nameInitials: string, bookings: SmoobuBooking[]): BookingMatchEntry | undefined {
    const finding = bookings.find(entry => new Date(entry.arrival) >= new Date(arrivalDate)
        && new Date(entry.departure) <= new Date(departureDate) && entry.firstname.charAt(0).toLowerCase() === nameInitials.charAt(0).toLowerCase()
    && entry.lastname.charAt(0).toLowerCase() === nameInitials.charAt(1).toLowerCase());
    if (finding) {
        return {
            nameInitials: nameInitials,
            arrivalDate: finding.arrival,
            departureDate: finding.departure
        }
    }
    return undefined;
}

async function handleDeletionOfCodes(listWithIdsToDelete: string[], env: Env) {
    for (const id of listWithIdsToDelete) {
        await deleteKeypadCode(id, env);
    }
}

function getNewCodeToCreateForMultipleUsers(remainingDatesAndInitialsAfterCheck: BookingMatchEntry[], code: string, env: Env): NukiCreateAuthPayload {
    let nameInitialsString = "";
    let arrivalDate = "";
    let departureDate = "";
    for (const entry of remainingDatesAndInitialsAfterCheck) {
        nameInitialsString += entry.nameInitials + ",";
        if (arrivalDate === "") {
            arrivalDate = entry.arrivalDate;
        } else if (new Date(entry.arrivalDate) < new Date(arrivalDate)) {
            arrivalDate = entry.arrivalDate;
        }
        if (departureDate === "") {
            departureDate = entry.departureDate;
        } else if (new Date(entry.departureDate) > new Date(departureDate)) {
            departureDate = entry.departureDate;
        }
    }
    return {
        name: formatDateToDayMonth(arrivalDate) + "-" + formatDateToDayMonth(departureDate) + "," + nameInitialsString.slice(0, -1),
        allowedFromDate: arrivalDate + "T13:00:00.000Z",
        allowedUntilDate: departureDate + "T09:00:00.000Z",
        allowedWeekDays: 127,
        allowedFromTime: 0,
        allowedUntilTime: 0,
        accountUserId: 0,
        smartlockIds: [Number(env.NUKI_SMARTLOCK_ID)],
        remoteAllowed: true,
        smartActionsEnabled: true,
        type: 13,
        code: Number(code)
    }
}

async function createNewCodesForRemainingUsers(listWithNewCodesToCreate: NukiCreateAuthPayload[], env: Env) {
    for (const newCode of listWithNewCodesToCreate) {
        await createKeypadCode(newCode, env);
    }
}

async function deleteAllOldCodes(env: Env) {
    const allActiveBookings = await getAllOpenBookings(env);
    await forceNukiSync(env);
    const allActiveCodes = await getAllKeypadCodes(env);
    const now = new Date();
    const listWithIdsToDelete: string[] = [];
    const listWithNewCodesToCreate: NukiCreateAuthPayload[] = [];
    for (const code of allActiveCodes) {
        const codeNameSplittedByComma = code.name.split(",");
        if (codeNameSplittedByComma.length == 1) {
            continue;
        }
        const dateSplittedByDash = codeNameSplittedByComma[0].trim().split("-");
        if (codeNameSplittedByComma.length == 2) {
            if (dateSplittedByDash.length !== 2) {
                console.log(`Ungueltiges Datum im Code-Namen: ${code.name}`);
                await sendGeneralMessageToAdmin(`Ungueltiges Datum im Code-Namen: ${code.name}`, env);
                continue;
            }
            let endDate = new Date(now.getFullYear() + "-" + dateSplittedByDash[1].substring(3) + "-" + dateSplittedByDash[1].substring(0, 2));
            if (dateSplittedByDash[1].trim().substring(3) < dateSplittedByDash[0].trim().substring(3)) {
                endDate.setFullYear(endDate.getFullYear() + 1);
            }
            if (endDate < now) {
                listWithIdsToDelete.push(code.id);
                continue;
            }
            const nameInitials = codeNameSplittedByComma[1].trim();
            if (!codeIsInBookingListMatchingAllCriteria(getFormattedDate(dateSplittedByDash[0]), getFormattedDate(dateSplittedByDash[1], dateSplittedByDash[0]), nameInitials, allActiveBookings.bookings)) {
                listWithIdsToDelete.push(code.id);
            }
        } else {
            let remainingInitialsBeforeCheck: string[] = [];
            let remainingDatesAndInitialsAfterCheck: BookingMatchEntry[] = [];
            for (let i = 1; i < codeNameSplittedByComma.length; i++) {
                remainingInitialsBeforeCheck.push(codeNameSplittedByComma[i].trim());
            }
            for (const nameInitials of remainingInitialsBeforeCheck) {
                const entryInTimespan = getEntryOfBookingListInTimespan(getFormattedDate(dateSplittedByDash[0]), getFormattedDate(dateSplittedByDash[1], dateSplittedByDash[0]), nameInitials, allActiveBookings.bookings);
                if (entryInTimespan) {
                    remainingDatesAndInitialsAfterCheck.push(entryInTimespan);
                }
            }
            if (remainingDatesAndInitialsAfterCheck.length < remainingInitialsBeforeCheck.length) {
                listWithIdsToDelete.push(code.id);
                if (remainingDatesAndInitialsAfterCheck.length >= 1) {
                    listWithNewCodesToCreate.push(getNewCodeToCreateForMultipleUsers(remainingDatesAndInitialsAfterCheck, code.code.toString(), env));
                }
            }
        }
    }
    await handleDeletionOfCodes(listWithIdsToDelete, env);
    if (listWithNewCodesToCreate.length > 0) {
        await forceNukiSync(env);
        await createNewCodesForRemainingUsers(listWithNewCodesToCreate, env);
    }
    await sendGeneralMessageToAdmin(`Es wurden ${listWithIdsToDelete.length} alte Codes gefunden, die gelöscht wurden. Und es wurden ${listWithNewCodesToCreate.length} neue Codes für die verbleibenden Nutzer erstellt.`, env, false);
    return `Es wurden ${listWithIdsToDelete.length} alte Codes gefunden, die gelöscht wurden. Und es wurden ${listWithNewCodesToCreate.length} neue Codes für die verbleibenden Nutzer erstellt.`;
}

export async function deleteOldCodesHandler(event: LambdaLikeEvent,
                              env: Env): Promise<LambdaLikeResponse> {
    try {
        if (!validateDeleteOldCodesRequest(event.body, env)) {
            return {
                statusCode: 400,
                headers: jsonHeaders,
                body: JSON.stringify({message: "Ungueltige Anfrage: Admin-Name stimmt nicht überein."})
            };
        }
        const result = await deleteAllOldCodes(env);

        return {
            statusCode: 200,
            headers: textHeaders,
            body: result
        };
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unbekannter Fehler im Lösche alle alten Codes Prozess.";
        console.log(`Fehler im Lösche alle alten Codes Prozess: ${message}`);
        await sendGeneralMessageToAdmin(`Fehler im Lösche alle alten Codes Prozess: ${message}`, env);
        return {
            statusCode: 400,
            headers: jsonHeaders,
            body: JSON.stringify({message})
        };
    }
}