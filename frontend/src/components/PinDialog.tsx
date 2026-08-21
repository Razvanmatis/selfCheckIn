type TranslationValues = Record<string, string>;

type PinDialogProps = {
  t: TranslationValues;
  pinCode: string;
  isPinCodeValid: boolean;
  isDefiningPin: boolean;
  hasExactlySixDigits: boolean;
  hasNoZero: boolean;
  doesNotStartWithTwelve: boolean;
  pinValidationMessages: string[];
  onPinCodeChange: (rawValue: string) => void;
  onGenerateAutoPinCode: () => void;
  onDefinePin: () => void;
  onClose: () => void;
};

export function PinDialog({
  t,
  pinCode,
  isPinCodeValid,
  isDefiningPin,
  hasExactlySixDigits,
  hasNoZero,
  doesNotStartWithTwelve,
  pinValidationMessages,
  onPinCodeChange,
  onGenerateAutoPinCode,
  onDefinePin,
  onClose
}: PinDialogProps) {
  return (
    <div className="dialog-backdrop" role="presentation">
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="pin-dialog-title">
        <h2 id="pin-dialog-title">{t.definePin}</h2>

        <label>
          {t.pinField}
          <input
            inputMode="numeric"
            autoComplete="off"
            value={pinCode}
            onChange={(event) => onPinCodeChange(event.target.value)}
          />
        </label>

        <button type="button" onClick={onGenerateAutoPinCode} className="button-secondary">
          {t.autoGenerateButton}
        </button>

        <p className="hint">{t.requirements}</p>
        <ul className="rule-list">
          <li className={hasExactlySixDigits ? "rule rule--valid" : "rule rule--invalid"}>
            {t.exactSixDigits}
          </li>
          <li className={hasNoZero ? "rule rule--valid" : "rule rule--invalid"}>{t.noZero}</li>
          <li className={doesNotStartWithTwelve ? "rule rule--valid" : "rule rule--invalid"}>
            {t.mustNotStartWith12}
          </li>
        </ul>

        {!isPinCodeValid && pinCode.length > 0 ? (
          <p className="status status--error" role="alert">
            {pinValidationMessages.map((message) => (
              <span key={message}>
                {message}
                <br />
              </span>
            ))}
          </p>
        ) : null}

        <button type="button" onClick={onDefinePin} disabled={!isPinCodeValid || isDefiningPin}>
          {isDefiningPin ? t.defining : t.defineButton}
        </button>

        <button type="button" onClick={onClose} disabled={isDefiningPin}>
          {t.abortButton}
        </button>
      </div>
    </div>
  );
}

