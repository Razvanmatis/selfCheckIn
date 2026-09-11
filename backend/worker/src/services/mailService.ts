import {EnvBoth} from "../types/envBoth";
import {sendMail} from "../handler/mailHandler";

export type MailRecipient =
    | string
    | {
    email: string;
    name?: string;
};

export type SendMailInput = {
    to: MailRecipient[];
    subject: string;
    text?: string;
    html?: string;
    replyTo?: string;
};

const bookingConfirmationTemplates: Record<string, {
    subject: string;
    greeting: string;
    codeLine: string;
    validity: string;
    closing: string;
}> = {
    de: {
        subject: "Dein Zugangscode wurde erfolgreich erstellt 🎉",
        greeting: "Hallo",
        codeLine: "Dein Zugangscode für den Zeitraum {timeSpan} lautet: {code} 🔑",
        validity: "Er ist gültig ab 15 Uhr am Anreisetag bis 11 Uhr am Abreisetag. 🕒",
        closing: "Ich wünsche dir einen schönen und angenehmen Aufenthalt! 😊🏡 Solltest du Fragen haben oder etwas benötigen, kannst du jederzeit den Chat-Bot auf meiner Homepage fragen oder dich direkt bei mir melden. Ich helfe dir gerne weiter! 😊"
    },
    en: {
        subject: "Your access code was created successfully 🎉",
        greeting: "Hello",
        codeLine: "Your access code for the period {timeSpan} is: {code} 🔑",
        validity: "It is valid from 3:00 PM on arrival day until 11:00 AM on departure day. 🕒",
        closing: "I wish you a wonderful and pleasant stay! 😊🏡 If you have any questions or need anything, you can always ask the chatbot on my website or contact me directly. I'm happy to help! 😊"
    },
    ru: {
        subject: "Ваш код доступа успешно создан 🎉",
        greeting: "Здравствуйте",
        codeLine: "Ваш код доступа на период {timeSpan}: {code} 🔑",
        validity: "Он действует с 15:00 в день заезда до 11:00 в день выезда. 🕒",
        closing: "Желаю вам приятного и комфортного пребывания! 😊🏡 Если у вас возникнут вопросы или вам что-то понадобится, вы всегда можете обратиться к чат-боту на моём сайте или связаться со мной напрямую. Я с удовольствием помогу! 😊"
    },
    zh: {
        subject: "您的访问代码已成功创建 🎉",
        greeting: "您好",
        codeLine: "您在 {timeSpan} 期间的访问代码为：{code} 🔑",
        validity: "它从入住当天15:00起生效，至离店当天11:00止。🕒",
        closing: "祝您入住愉快，度过一段美好的时光！😊🏡 如果您有任何问题或需要帮助，随时可以咨询我网站上的聊天机器人，也可以直接联系我。我很乐意为您提供帮助！😊"
    },
    hi: {
        subject: "आपका एक्सेस कोड सफलतापूर्वक बनाया गया 🎉",
        greeting: "नमस्ते",
        codeLine: "{timeSpan} अवधि के लिए आपका एक्सेस कोड है: {code} 🔑",
        validity: "यह आगमन दिन की 15:00 बजे से शुरू होता है और प्रस्थान दिन की 11:00 बजे तक मान्य रहता है। 🕒",
        closing: "मैं आपके सुखद और आरामदायक प्रवास की कामना करता हूँ! 😊🏡 यदि आपके कोई प्रश्न हों या आपको किसी चीज़ की आवश्यकता हो, तो आप कभी भी मेरी वेबसाइट पर चैट-बॉट से पूछ सकते हैं या सीधे मुझसे संपर्क कर सकते हैं। मुझे आपकी मदद करके खुशी होगी! 😊"
    },
    it: {
        subject: "Il tuo codice di accesso è stato creato con successo 🎉",
        greeting: "Ciao",
        codeLine: "Il tuo codice di accesso per il periodo {timeSpan} è: {code} 🔑",
        validity: "È valido dalle 15:00 del giorno di arrivo fino alle 11:00 del giorno di partenza. 🕒",
        closing: "Ti auguro un soggiorno piacevole e rilassante! 😊🏡 Se hai domande o hai bisogno di qualcosa, puoi sempre chiedere al chatbot sul mio sito web oppure contattarmi direttamente. Sarò felice di aiutarti! 😊"
    },
    es: {
        subject: "Tu código de acceso se creó correctamente 🎉",
        greeting: "Hola",
        codeLine: "Tu código de acceso para el período {timeSpan} es: {code} 🔑",
        validity: "Es válido desde las 15:00 del día de llegada hasta las 11:00 del día de salida. 🕒",
        closing: "¡Te deseo una estancia agradable y relajante! 😊🏡 Si tienes alguna pregunta o necesitas cualquier cosa, puedes consultar en cualquier momento el chatbot de mi página web o ponerte en contacto conmigo directamente. ¡Estaré encantado de ayudarte! 😊"
    },
    el: {
        subject: "Ο κωδικός πρόσβασης δημιουργήθηκε επιτυχώς 🎉",
        greeting: "Γεια σου",
        codeLine: "Ο κωδικός πρόσβασής σου για την περίοδο {timeSpan} είναι: {code} 🔑",
        validity: "Ισχύει από τις 15:00 της ημέρας άφιξης έως τις 11:00 της ημέρας αναχώρησης. 🕒",
        closing: "Σου εύχομαι μια όμορφη και ευχάριστη διαμονή! 😊🏡 Αν έχεις οποιαδήποτε ερώτηση ή χρειάζεσαι κάτι, μπορείς jederzeit να ρωτήσεις το chatbot στην ιστοσελίδα μου ή να επικοινωνήσεις απευθείας μαζί μου. Θα χαρώ πολύ να βοηθήσω! 😊"
    },
    pt: {
        subject: "Seu código de acesso foi criado com sucesso 🎉",
        greeting: "Olá",
        codeLine: "Seu código de acesso para o período {timeSpan} é: {code} 🔑",
        validity: "É válido a partir das 15:00 do dia de chegada até às 11:00 do dia de partida. 🕒",
        closing: "Desejo-te uma estadia agradável e relaxante! 😊🏡 Se tiveres alguma dúvida ou precisares de alguma coisa, podes sempre perguntar ao chatbot no meu site ou entrar em contacto comigo diretamente. Terei todo o gosto em ajudar! 😊"
    },
    ja: {
        subject: "アクセスコードが正常に作成されました 🎉",
        greeting: "こんにちは",
        codeLine: "{timeSpan} の期間のアクセスコードは: {code} 🔑",
        validity: "到着日の15:00から出発日の11:00まで有効です。🕒",
        closing: "快適で素敵な滞在をお楽しみください！😊🏡 ご質問やお困りのことがありましたら、いつでも私のウェブサイトのチャットボットに質問するか、直接ご連絡ください。喜んでお手伝いします！😊"
    },
    th: {
        subject: "รหัสเข้าถึงของคุณถูกสร้างเรียบร้อยแล้ว 🎉",
        greeting: "สวัสดี",
        codeLine: "รหัสเข้าถึงสำหรับช่วงเวลา {timeSpan} ของคุณคือ: {code} 🔑",
        validity: "มีผลตั้งแต่เวลา 15:00 ของวันเข้าพักจนถึงเวลา 11:00 ของวันออกเดินทาง 🕒",
        closing: "ขอให้คุณมีช่วงเวลาที่ดีและมีความสุขกับการเข้าพักนะครับ! 😊🏡 หากมีคำถามหรือต้องการความช่วยเหลือ สามารถสอบถามแชทบอทบนเว็บไซต์ของผมได้ตลอดเวลา หรือจะติดต่อผมโดยตรงก็ได้ครับ ยินดีช่วยเหลือเสมอ! 😊"
    },
    vi: {
        subject: "Mã truy cập của bạn đã được tạo thành công 🎉",
        greeting: "Xin chào",
        codeLine: "Mã truy cập của bạn cho khoảng thời gian {timeSpan} là: {code} 🔑",
        validity: "Mã này có hiệu lực từ 15:00 ngày đến đến 11:00 ngày đi. 🕒",
        closing: "Chúc bạn có một kỳ nghỉ thật thoải mái và vui vẻ! 😊🏡 Nếu bạn có bất kỳ câu hỏi nào hoặc cần hỗ trợ, bạn có thể hỏi chatbot trên trang web của tôi bất cứ lúc nào hoặc liên hệ trực tiếp với tôi. Tôi luôn sẵn lòng giúp đỡ! 😊"
    },
    cs: {
        subject: "Váš přístupový kód byl úspěšně vytvořen 🎉",
        greeting: "Ahoj",
        codeLine: "Váš přístupový kód pro období {timeSpan} je: {code} 🔑",
        validity: "Je platný od 15:00 v den příjezdu do 11:00 v den odjezdu. 🕒",
        closing: "Přeji ti příjemný a pohodový pobyt! 😊🏡 Pokud budeš mít jakékoli dotazy nebo budeš něco potřebovat, můžeš se kdykoli zeptat chatbota na mém webu nebo mě přímo kontaktovat. Rád ti pomůžu! 😊"
    },
    pl: {
        subject: "Twój kod dostępu został pomyślnie utworzony 🎉",
        greeting: "Cześć",
        codeLine: "Twój kod dostępu dla okresu {timeSpan} to: {code} 🔑",
        validity: "Jest ważny od 15:00 dnia przyjazdu do 11:00 dnia wyjazdu. 🕒",
        closing: "Życzę Ci miłego i przyjemnego pobytu! 😊🏡 Jeśli masz jakiekolwiek pytania lub czegoś potrzebujesz, możesz w każdej chwili zapytać chatbota na mojej stronie internetowej albo skontaktować się ze mną bezpośrednio. Chętnie Ci pomogę! 😊"
    },
    ro: {
        subject: "Codul tău de acces a fost creat cu succes 🎉",
        greeting: "Bună",
        codeLine: "Codul tău de acces pentru perioada {timeSpan} este: {code} 🔑",
        validity: "Este valabil de la 15:00 în ziua sosirii până la 11:00 în ziua plecării. 🕒",
        closing: "Îți doresc un sejur plăcut și relaxant! 😊🏡 Dacă ai întrebări sau ai nevoie de ceva, poți oricând să întrebi chatbotul de pe site-ul meu sau să mă contactezi direct. Îți voi fi bucuros să te ajut! 😊"
    },
    sr: {
        subject: "Tvoj pristupni kod je uspešno kreiran 🎉",
        greeting: "Zdravo",
        codeLine: "Tvoj pristupni kod za period {timeSpan} je: {code} 🔑",
        validity: "Važi od 15:00 na dan dolaska do 11:00 na dan odlaska. 🕒",
        closing: "Želim ti prijatan i opušten boravak! 😊🏡 Ako imaš bilo kakvih pitanja ili ti nešto zatreba, uvek možeš da pitaš chatbot na mom sajtu ili da me direktno kontaktiraš. Rado ću ti pomoći! 😊"
    },
    fr: {
        subject: "Ton code d'accès a été créé avec succès 🎉",
        greeting: "Bonjour",
        codeLine: "Ton code d'accès pour la période {timeSpan} est : {code} 🔑",
        validity: "Il est valide à partir de 15h le jour d'arrivée jusqu'à 11h le jour du départ. 🕒",
        closing: "Je te souhaite un agréable et très bon séjour ! 😊🏡 Si tu as des questions ou besoin de quoi que ce soit, tu peux à tout moment consulter le chatbot sur mon site web ou me contacter directement. Je serai ravi de t'aider ! 😊"
    }
};

export function getBookingConfirmationText(language: string | undefined, fullName: string, timeSpan: string, code: string): {
    subject: string;
    text: string
} {
    const normalizedLanguage = (language ?? "de").trim().toLowerCase();
    const template = bookingConfirmationTemplates[normalizedLanguage] ?? bookingConfirmationTemplates.de;
    const codeLine = template.codeLine.replace("{timeSpan}", timeSpan).replace("{code}", code);

    return {
        subject: template.subject,
        text: `${template.greeting} ${fullName},\n\n${codeLine}\n\n${template.validity}\n\n${template.closing}`
    };
}

export async function sendBookingConfirmationEmailToAdmin(fullName: string, timeSpan: string, code: string, env: EnvBoth): Promise<void> {
    const content = getBookingConfirmationText("de", fullName, timeSpan, code);
    await sendMail(
        {
            to: [{email: env.EMAIL_FROM, name: 'Razvan Matis'}],
            subject: content.subject,
            text: content.text
        },
        env
    );
}

export async function sendErrorNotificationEmail(errorMessage: string, fullName: string, timeSpan: string, env: EnvBoth, code?: string): Promise<void> {
    const now = new Date();
    const timestamp = now.toLocaleString("de-DE", {
        dateStyle: "short",
        timeStyle: "medium"
    });
    await sendMail(
        {
            to: [{email: env.EMAIL_FROM, name: 'Razvan Matis'}],
            subject: "Fehler in der Anwendung!",
            text: `Ein Fehler ist in der Anwendung aufgetreten am ${timestamp}Uhr:\n\n${errorMessage}\n\nDetails:\nName: ${fullName}\nZeitraum: ${timeSpan} ${code ? `\nCode: ${code}` : ""}`
        },
        env
    );
}

export async function sendGeneralMessageToAdmin(message: string, env: EnvBoth, useAsWarning = true): Promise<void> {
    const now = new Date();
    const timestamp = now.toLocaleString("de-DE", {
        dateStyle: "short",
        timeStyle: "medium"
    });
    await sendMail(
        {
            to: [{email: env.EMAIL_FROM, name: 'Razvan Matis'}],
            subject: useAsWarning ? "Warnung: Problem mit der AI-Antwort" : "Info von der Anwendung",
            text: useAsWarning ? `Eine Warnung wurde in der Anwendung am ${timestamp}Uhr ausgelöst:\n\n${message}`
                : `Eine Info wurde in der Anwendung am ${timestamp}Uhr ausgelöst:\n\n${message}`
        },
        env
    );
}