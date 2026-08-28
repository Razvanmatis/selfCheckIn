type TranslationValues = Record<string, string>;

type RuleItem = {
  icon: string;
  text: string;
};

type PreCheckInDialogProps = {
  t: TranslationValues;
  title: string;
  description?: string;
  items: RuleItem[];
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  linkHref?: string;
  linkLabel?: string;
};

export function PreCheckInDialog({
  t,
  title,
  description,
  items,
  confirmLabel,
  onConfirm,
  onClose,
  linkHref,
  linkLabel
}: PreCheckInDialogProps) {
  return (
    <div className="dialog-backdrop" role="presentation">
      <div className="dialog dialog--fancy" role="dialog" aria-modal="true" aria-labelledby="pre-check-in-title">
        <div className="dialog-hero">
          <span className="dialog-hero__badge" aria-hidden="true">
            ✨
          </span>
          <div>
            <h2 id="pre-check-in-title">{title}</h2>
            {description ? <p className="hint dialog-description">{description}</p> : null}
          </div>
        </div>

        <div className="fancy-rule-list">
          {items.map((item) => (
            <div key={item.text} className="fancy-rule-item">
              <span className="fancy-rule-item__icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        {linkHref && linkLabel ? (
          <a
            className="dialog-link"
            href={linkHref}
            target="_blank"
            rel="noreferrer"
          >
            {linkLabel}
          </a>
        ) : null}

        <div className="dialog-actions">
          <button type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button type="button" onClick={onClose} className="button-secondary">
            {t.abortButton}
          </button>
        </div>
      </div>
    </div>
  );
}
