import type { UpdatePhoneNumberPayload } from "../api/updatePhoneNumber";

type UpdatePhoneNumberDialogProps = {
  form: UpdatePhoneNumberPayload;
  today: string;
  isSubmitting: boolean;
  onChange: (form: UpdatePhoneNumberPayload) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export function UpdatePhoneNumberDialog({
  form,
  today,
  isSubmitting,
  onChange,
  onConfirm,
  onClose
}: UpdatePhoneNumberDialogProps) {
  const isComplete =
    form.adminUser.trim().length > 0 &&
    form.phone.trim().length > 0 &&
    form.arrival.length > 0 &&
    form.departure.length > 0;

  return (
    <div className="dialog-backdrop" role="presentation">
      <div
        className="dialog dialog--compact"
        role="dialog"
        aria-modal="true"
        aria-labelledby="update-phone-number-dialog-title"
      >
        <h2 id="update-phone-number-dialog-title">Telefonnummer updaten</h2>

        <label>
          Admin-User
          <input
            value={form.adminUser}
            onChange={(event) => onChange({ ...form, adminUser: event.target.value })}
            disabled={isSubmitting}
            autoFocus
          />
        </label>

        <label>
          Telefonnummer
          <input
            type="tel"
            value={form.phone}
            onChange={(event) => onChange({ ...form, phone: event.target.value })}
            disabled={isSubmitting}
          />
        </label>

        <label>
          Ankunft
          <input
            type="date"
            min={today}
            value={form.arrival}
            onChange={(event) => onChange({ ...form, arrival: event.target.value })}
            disabled={isSubmitting}
          />
        </label>

        <label>
          Abreise
          <input
            type="date"
            min={today}
            value={form.departure}
            onChange={(event) => onChange({ ...form, departure: event.target.value })}
            disabled={isSubmitting}
          />
        </label>

        <div className="dialog-actions dialog-actions--inline">
          <button type="button" onClick={onConfirm} disabled={!isComplete || isSubmitting}>
            {isSubmitting ? "..." : "OK"}
          </button>
          <button
            type="button"
            className="button-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
