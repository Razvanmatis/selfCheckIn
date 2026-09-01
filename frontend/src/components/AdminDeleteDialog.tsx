type TranslationValues = Record<string, string>;

type AdminDeleteDialogProps = {
  t: TranslationValues;
  adminUser: string;
  isDeletingOldCodes: boolean;
  onAdminUserChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export function AdminDeleteDialog({
  t,
  adminUser,
  isDeletingOldCodes,
  onAdminUserChange,
  onConfirm,
  onClose
}: AdminDeleteDialogProps) {
  return (
    <div className="dialog-backdrop" role="presentation">
      <div className="dialog dialog--compact" role="dialog" aria-modal="true" aria-labelledby="admin-delete-dialog-title">
        <div className="dialog-hero">
          <span className="dialog-hero__badge" aria-hidden="true">
            🛠️
          </span>
          <div>
            <h2 id="admin-delete-dialog-title">Delete old codes</h2>
            <p className="hint dialog-description">Admin-Funktion zum Bereinigen alter Nuki-Codes.</p>
          </div>
        </div>

        <label>
          Admin-User:
          <input
            value={adminUser}
            onChange={(event) => onAdminUserChange(event.target.value)}
            disabled={isDeletingOldCodes}
            autoFocus
          />
        </label>

        <div className="dialog-actions dialog-actions--inline">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeletingOldCodes || !adminUser.trim()}
          >
            {isDeletingOldCodes ? "..." : "OK"}
          </button>
          <button type="button" onClick={onClose} className="button-secondary" disabled={isDeletingOldCodes}>
            {t.abortButton}
          </button>
        </div>
      </div>
    </div>
  );
}
