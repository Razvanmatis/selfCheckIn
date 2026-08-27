import { useMemo, useState, type FormEvent } from "react";
import { defineKeypadCode } from "./api/defineKeypadCode";
import { getCheckInInformation } from "./api/getCheckInInformation";
import { initiateCheckInProcess } from "./api/initiateCheckInProcess";
import { LanguageSelector } from "./components/LanguageSelector";
import { PinDialog } from "./components/PinDialog";
import type { Language } from "./i18n/translations";
import { translations } from "./i18n/translations";
import type { GuestLookupForm } from "./types/forms";
import type { LoginMode } from "./types/ui";
import {
  buildSubmissionForm,
  getDateBounds,
  getMinCheckOutDate,
  initialGuestLookupForm,
  isFormReady,
  withUpdatedCheckInDate
} from "./utils/checkInForm";
import { generateAutoPinCode, isPinCodeValid, sanitizePinInput } from "./utils/pinCode";
import { sanitizePhoneInput } from "./utils/phone";

function App() {
  const [form, setForm] = useState<GuestLookupForm>(initialGuestLookupForm);
  const [loginMode, setLoginMode] = useState<LoginMode>("name");
  const [language, setLanguage] = useState<Language>("en");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingInstructions, setIsLoadingInstructions] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<string | null>(null);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const [isDefiningPin, setIsDefiningPin] = useState(false);
  const [dialogPhoneNumber, setDialogPhoneNumber] = useState("");

  const t = translations[language];
  const { today, maxDate, maxCheckInDate } = useMemo(() => getDateBounds(), []);

  const isReady = useMemo(() => isFormReady(form, loginMode), [form, loginMode]);
  const minCheckOutDate = useMemo(() => getMinCheckOutDate(form.checkInDate), [form.checkInDate]);

  const isCheckOutDateInvalid = useMemo(() => {
    if (!form.checkInDate || !form.checkOutDate) {
      return false;
    }

    return form.checkOutDate < minCheckOutDate;
  }, [form.checkInDate, form.checkOutDate, minCheckOutDate]);

  const isCheckInDateTooFarInFuture = useMemo(() => {
    if (!form.checkInDate.trim()) {
      return false;
    }

    return form.checkInDate > maxCheckInDate;
  }, [form.checkInDate, maxCheckInDate]);

  const hasExactlySixDigits = useMemo(() => /^\d{6}$/.test(pinCode), [pinCode]);
  const hasNoZero = useMemo(() => !pinCode.includes("0"), [pinCode]);
  const doesNotStartWithTwelve = useMemo(() => !pinCode.startsWith("12"), [pinCode]);
  const pinCodeIsValid = useMemo(() => isPinCodeValid(pinCode), [pinCode]);

  const pinValidationMessages = useMemo(() => {
    const messages: string[] = [];

    if (!hasExactlySixDigits) {
      messages.push(t.exactSixDigits);
    }

    if (!hasNoZero) {
      messages.push(t.noZero);
    }

    if (!doesNotStartWithTwelve) {
      messages.push(t.mustNotStartWith12);
    }

    return messages;
  }, [hasExactlySixDigits, hasNoZero, doesNotStartWithTwelve, t]);

  const isFormActionDisabled =
    !isReady ||
    isSubmitting ||
    isLoadingInstructions ||
    isCheckInDateTooFarInFuture ||
    isCheckOutDateInvalid;

  const handlePinCodeChange = (rawValue: string) => {
    setPinCode(sanitizePinInput(rawValue));
  };

  const handlePhoneChange = (rawValue: string) => {
    setForm((prev) => ({ ...prev, phone: sanitizePhoneInput(rawValue) }));
  };

  const getFormDataForSubmission = (): GuestLookupForm => buildSubmissionForm(form, loginMode);

  const handleDefinePin = async () => {
    if (!pinCodeIsValid) {
      return;
    }

    setIsDefiningPin(true);

    try {
      const formData = getFormDataForSubmission();
      const result = await defineKeypadCode({
        ...formData,
        pinCode,
        language
      });

      if (result === "validationError") {
        const validationMessage = t.invalidDataError;
        setSubmitError(validationMessage);
        window.alert(validationMessage);
        return;
      }

      setIsPinDialogOpen(false);
      setSubmitError(null);
      setSubmitResult(result);
      setDialogPhoneNumber("");
      window.confirm(t.codeCreatedSuccess);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t.unknownPinError;
      setSubmitError(errorMessage);
      window.alert(errorMessage);
    } finally {
      setIsDefiningPin(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isFormActionDisabled) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitResult(null);

    try {
      const formData = getFormDataForSubmission();
      const result = await initiateCheckInProcess(formData);

      if (result === "validationError") {
        const validationMessage = t.invalidDataError;
        setSubmitError(validationMessage);
        window.alert(validationMessage);
        return;
      }

      if (result === "OK") {
        setPinCode("");
        setDialogPhoneNumber(loginMode === "phone" ? form.phone : "");
        setIsPinDialogOpen(true);
        return;
      }

      setSubmitResult(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t.unknownCheckInError;
      setSubmitError(errorMessage);
      window.alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetCheckInInstructions = async () => {
    if (isFormActionDisabled) {
      return;
    }

    setIsLoadingInstructions(true);
    setSubmitError(null);

    try {
      const formData = getFormDataForSubmission();
      await getCheckInInformation(formData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t.unknownInstructionsError;
      setSubmitError(errorMessage);
      window.alert(errorMessage);
    } finally {
      setIsLoadingInstructions(false);
    }
  };

  const closePinDialog = () => {
    setIsPinDialogOpen(false);
    setDialogPhoneNumber("");
  };

  return (
    <main className="layout">
      <section className="card">
        <div className="card-header">
          <h1>{t.title}</h1>
          <LanguageSelector language={language} onLanguageChange={setLanguage} />
        </div>
        <p className="hint">{t.hint}</p>

        <form className="form" onSubmit={handleSubmit}>
          <fieldset className="login-mode-selector">
            <legend>{t.loginMode}</legend>
            <label className="radio-option">
              <input
                type="radio"
                name="loginMode"
                value="name"
                checked={loginMode === "name"}
                onChange={() => {
                  setLoginMode("name");
                  setForm((prev) => ({ ...prev, phone: "" }));
                }}
              />
              {t.nameOption}
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="loginMode"
                value="phone"
                checked={loginMode === "phone"}
                onChange={() => {
                  setLoginMode("phone");
                  setForm((prev) => ({ ...prev, firstName: "", lastName: "" }));
                }}
              />
              {t.phoneOption}
            </label>
          </fieldset>

          {loginMode === "name" ? (
            <>
              <label>
                {t.firstName}
                <input
                  required
                  value={form.firstName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, firstName: event.target.value }))
                  }
                />
              </label>

              <label>
                {t.lastName}
                <input
                  required
                  value={form.lastName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, lastName: event.target.value }))
                  }
                />
              </label>
            </>
          ) : (
            <label>
              {t.phone}
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(event) => handlePhoneChange(event.target.value)}
                placeholder={t.phonePlaceholder}
              />
            </label>
          )}

          <label>
            {t.checkInDate}
            <input
              required
              type="date"
              min={today}
              max={maxDate}
              value={form.checkInDate}
              onChange={(event) =>
                setForm((prev) => withUpdatedCheckInDate(prev, event.target.value))
              }
            />
          </label>

          {isCheckInDateTooFarInFuture ? (
            <p className="status status--error" role="alert">
              {t.checkInDateTooFar}
            </p>
          ) : null}

          <label>
            {t.checkOutDate}
            <input
              required
              type="date"
              min={minCheckOutDate || today}
              max={maxDate}
              value={form.checkOutDate}
              disabled={!form.checkInDate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, checkOutDate: event.target.value }))
              }
            />
          </label>

          {isCheckOutDateInvalid ? (
            <p className="status status--error" role="alert">
              {t.checkOutDateInvalid}
            </p>
          ) : null}

          <button type="submit" disabled={isFormActionDisabled}>
            {isSubmitting ? t.submitting : t.submitButton}
          </button>

          <button
            type="button"
            onClick={handleGetCheckInInstructions}
            disabled={isFormActionDisabled}
          >
            {isLoadingInstructions ? t.loadingInstructions : t.getInstructionsButton}
          </button>

          {submitError ? (
            <p className="status status--error" role="alert">
              {submitError}
            </p>
          ) : null}

          {submitResult ? (
            <p className="status status--success">
              {t.serverResponse} <strong>{submitResult}</strong>
            </p>
          ) : null}
        </form>
      </section>

      {isPinDialogOpen ? (
        <PinDialog
          t={t}
          pinCode={pinCode}
          isPinCodeValid={pinCodeIsValid}
          isDefiningPin={isDefiningPin}
          hasExactlySixDigits={hasExactlySixDigits}
          hasNoZero={hasNoZero}
          doesNotStartWithTwelve={doesNotStartWithTwelve}
          pinValidationMessages={pinValidationMessages}
          onPinCodeChange={handlePinCodeChange}
          onGenerateAutoPinCode={() => setPinCode(generateAutoPinCode(dialogPhoneNumber))}
          onDefinePin={handleDefinePin}
          onClose={closePinDialog}
        />
      ) : null}
    </main>
  );
}

export default App;
