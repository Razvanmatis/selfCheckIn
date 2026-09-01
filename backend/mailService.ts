import type { Env } from "./env.js";

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

function normalizeRecipients(recipients: MailRecipient[]) {
  if (!recipients.length) {
    throw new Error("At least one recipient is required.");
  }

  return recipients.map((recipient) => {
    if (typeof recipient === "string") {
      const email = recipient.trim();

      if (!email) {
        throw new Error("Recipient email is required.");
      }

      return { email };
    }

    if (!recipient.email?.trim()) {
      throw new Error("Recipient email is required.");
    }

    return {
      email: recipient.email.trim(),
      ...(recipient.name?.trim()
          ? { name: recipient.name.trim() }
          : {})
    };
  });
}

async function sendMail(
    input: SendMailInput,
    env: Env
): Promise<{ messageId?: string; status: "sent" }> {
  const apiKey = env.BREVO_API_KEY?.trim();
  const from = env.EMAIL_FROM?.trim();

  if (!apiKey) {
    throw new Error("Missing Brevo configuration: BREVO_API_KEY is required.");
  }

  if (!from) {
    throw new Error("Missing sender configuration: EMAIL_FROM is required.");
  }

  if (!input.subject?.trim()) {
    throw new Error("Email subject is required.");
  }

  if (!input.text?.trim() && !input.html?.trim()) {
    throw new Error("Email must contain either text or HTML content.");
  }

  const body = {
    sender: {
      email: from,
      name: "Raz Check-In"
    },
    to: normalizeRecipients(input.to),
    subject: input.subject.trim(),
    ...(input.text?.trim()
        ? { textContent: input.text.trim() }
        : {}),
    ...(input.html?.trim()
        ? { htmlContent: input.html.trim() }
        : {}),
    ...(input.replyTo?.trim()
        ? {
          replyTo: {
            email: input.replyTo.trim()
          }
        }
        : {})
  };

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
        `Brevo API request failed (${response.status}): ${errorBody}`
    );
  }

  const result = (await response.json()) as {
    messageId?: string;
  };

  return {
    messageId: result.messageId,
    status: "sent"
  };
}

const bookingConfirmationTemplates: Record<string, { subject: string; greeting: string; codeLine: string; validity: string; }> = {
  de: {
    subject: "Ihr Zugangscode wurde erfolgreich erstellt",
    greeting: "Hallo",
    codeLine: "Ihr Zugangscode für den Zeitraum {timeSpan} lautet: {code}",
    validity: "Er ist gültig ab 15 Uhr am Anreisetag bis 11 Uhr am Abreisetag."
  },
  en: {
    subject: "Your access code was created successfully",
    greeting: "Hello",
    codeLine: "Your access code for the period {timeSpan} is: {code}",
    validity: "It is valid from 3:00 PM on arrival day until 11:00 AM on departure day."
  },
  ru: {
    subject: "Ваш код доступа успешно создан",
    greeting: "Здравствуйте",
    codeLine: "Ваш код доступа на период {timeSpan}: {code}",
    validity: "Он действует с 15:00 в день заезда до 11:00 в день выезда."
  },
  zh: {
    subject: "您的访问代码已成功创建",
    greeting: "您好",
    codeLine: "您在 {timeSpan} 期间的访问代码为：{code}",
    validity: "它从入住当天15:00起生效，至离店当天11:00止。"
  },
  hi: {
    subject: "आपका एक्सेस कोड सफलतापूर्वक बनाया गया",
    greeting: "नमस्ते",
    codeLine: "{timeSpan} अवधि के लिए आपका एक्सेस कोड है: {code}",
    validity: "यह आगमन दिन की 15:00 बजे से शुरुआत होता है और प्रस्थान दिन की 11:00 बजे तक मान्य रहता है।"
  },
  it: {
    subject: "Il tuo codice di accesso è stato creato con successo",
    greeting: "Ciao",
    codeLine: "Il tuo codice di accesso per il periodo {timeSpan} è: {code}",
    validity: "È valido dalle 15:00 del giorno di arrivo fino alle 11:00 del giorno di partenza."
  },
  es: {
    subject: "Su código de acceso se creó correctamente",
    greeting: "Hola",
    codeLine: "Su código de acceso para el período {timeSpan} es: {code}",
    validity: "Es válido desde las 15:00 del día de llegada hasta las 11:00 del día de salida."
  },
  el: {
    subject: "Ο κωδικός πρόσβασης δημιουργήθηκε επιτυχώς",
    greeting: "Γεια σας",
    codeLine: "Ο κωδικός πρόσβασής σας για την περίοδο {timeSpan} είναι: {code}",
    validity: "Ισχύει από τις 15:00 της ημέρας άφιξης έως τις 11:00 της ημέρας αναχώρησης."
  },
  pt: {
    subject: "Seu código de acesso foi criado com sucesso",
    greeting: "Olá",
    codeLine: "Seu código de acesso para o período {timeSpan} é: {code}",
    validity: "É válido a partir das 15:00 do dia de chegada até às 11:00 do dia de partida."
  },
  ja: {
    subject: "アクセスコードが正常に作成されました",
    greeting: "こんにちは",
    codeLine: "{timeSpan} の期間のアクセスコードは: {code}",
    validity: "到着日の15:00から出発日の11:00まで有効です。"
  },
  th: {
    subject: "รหัสเข้าถึงของคุณถูกสร้างเรียบร้อยแล้ว",
    greeting: "สวัสดี",
    codeLine: "รหัสเข้าถึงสำหรับช่วงเวลา {timeSpan} ของคุณคือ: {code}",
    validity: "มีผลตั้งแต่เวลา 15:00 ของวันเข้าพักจนถึงเวลา 11:00 ของวันออกเดินทาง"
  },
  vi: {
    subject: "Mã truy cập của bạn đã được tạo thành công",
    greeting: "Xin chào",
    codeLine: "Mã truy cập của bạn cho khoảng thời gian {timeSpan} là: {code}",
    validity: "Mã này có hiệu lực từ 15:00 ngày đến đến 11:00 ngày đi."
  },
  cs: {
    subject: "Váš přístupový kód byl úspěšně vytvořen",
    greeting: "Dobrý den",
    codeLine: "Váš přístupový kód pro období {timeSpan} je: {code}",
    validity: "Je platný od 15:00 v den příjezdu do 11:00 v den odjezdu."
  },
  pl: {
    subject: "Twój kod dostępu został pomyślnie utworzony",
    greeting: "Cześć",
    codeLine: "Twój kod dostępu dla okresu {timeSpan} to: {code}",
    validity: "Jest ważny od 15:00 dnia przyjazdu do 11:00 dnia wyjazdu."
  },
  ro: {
    subject: "Codul dvs. de acces a fost creat cu succes",
    greeting: "Bună ziua",
    codeLine: "Codul dvs. de acces pentru perioada {timeSpan} este: {code}",
    validity: "Este valabil de la 15:00 în ziua sosirii până la 11:00 în ziua plecării."
  },
  sr: {
    subject: "Vaš pristupni kod je uspešno kreiran",
    greeting: "Zdravo",
    codeLine: "Vaš pristupni kod za period {timeSpan} je: {code}",
    validity: "Važi od 15:00 na dan dolaska do 11:00 na dan odlaska."
  },
  fr: {
    subject: "Votre code d'accès a été créé avec succès",
    greeting: "Bonjour",
    codeLine: "Votre code d'accès pour la période {timeSpan} est : {code}",
    validity: "Il est valide à partir de 15h le jour d'arrivée jusqu'à 11h le jour du départ."
  }
};

function getBookingConfirmationText(language: string | undefined, fullName: string, timeSpan: string, code: string): { subject: string; text: string } {
  const normalizedLanguage = (language ?? "de").trim().toLowerCase();
  const template = bookingConfirmationTemplates[normalizedLanguage] ?? bookingConfirmationTemplates.de;
  const codeLine = template.codeLine.replace("{timeSpan}", timeSpan).replace("{code}", code);

  return {
    subject: template.subject,
    text: `${template.greeting} ${fullName},\n\n${codeLine}\n\n${template.validity}`
  };
}

export async function sendBookingConfirmationEmail(recipientEmail: string, fullName: string, timeSpan: string, code: string, env: Env, language?: string): Promise<void> {
  const content = getBookingConfirmationText(language, fullName, timeSpan, code);

  await sendMail(
      {
        to: [{ email: recipientEmail, name: fullName }],
        subject: content.subject,
        text: content.text
      },
      env
  );
  await sendMail(
      {
        to: [{ email: env.EMAIL_FROM, name: 'Razvan Matis' }],
        subject: content.subject,
        text: content.text
      },
      env
  );
}

export async function sendErrorNotificationEmail(errorMessage: string, fullName: string, timeSpan: string, env: Env, code?: string): Promise<void> {
  const now = new Date();
  const timestamp = now.toLocaleString("de-DE", {
    dateStyle: "short",
    timeStyle: "medium"
  });
  await sendMail(
      {
        to: [{ email: env.EMAIL_FROM, name: 'Razvan Matis' }],
        subject: "Fehler in der Anwendung!",
        text: `Ein Fehler ist in der Anwendung aufgetreten am ${timestamp}Uhr:\n\n${errorMessage}\n\nDetails:\nName: ${fullName}\nZeitraum: ${timeSpan} ${code ? `\nCode: ${code}` : ""}`
      },
      env
  );
}

export async function sendGeneralMessageToAdmin(errorMessage: string, env: Env): Promise<void> {
  const now = new Date();
  const timestamp = now.toLocaleString("de-DE", {
    dateStyle: "short",
    timeStyle: "medium"
  });
  await sendMail(
      {
        to: [{ email: env.EMAIL_FROM, name: 'Razvan Matis' }],
        subject: "Warnung: Problem mit der AI-Antwort",
        text: `Eine Warnung wurde in der Anwendung am ${timestamp}Uhr ausgelöst:\n\n${errorMessage}`
      },
      env
  );
}