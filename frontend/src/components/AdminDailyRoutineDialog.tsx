type AdminDailyRoutineDialogProps = {
  adminUser: string;
  isRunningDailyRoutine: boolean;
  onAdminUserChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export function AdminDailyRoutineDialog({
  adminUser,
  isRunningDailyRoutine,
  onAdminUserChange,
  onConfirm,
  onClose
}: AdminDailyRoutineDialogProps) {
  return (
    <div className="dialog-backdrop" role="presentation">
      <div className="dialog dialog--compact" role="dialog" aria-modal="true" aria-labelledby="admin-daily-routine-dialog-title">
        <div className="dialog-hero">
          <span className="dialog-hero__badge" aria-hidden="true">
            🛠️
          </span>
          <div>
            <h2 id="admin-daily-routine-dialog-title">Tägliche Routine triggern</h2>
            <p className="hint dialog-description">Admin-Funktion zum Ausführen der täglichen Routine.</p>
          </div>
        </div>

        <label>
          Admin-User
          <input
            value={adminUser}
            onChange={(event) => onAdminUserChange(event.target.value)}
            disabled={isRunningDailyRoutine}
            autoFocus
          />
        </label>

        <div className="dialog-actions dialog-actions--inline">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isRunningDailyRoutine || !adminUser.trim()}
          >
            {isRunningDailyRoutine ? "..." : "OK"}
          </button>
          <button type="button" onClick={onClose} className="button-secondary" disabled={isRunningDailyRoutine}>
            {"Abbrechen"}
          </button>
        </div>
      </div>
    </div>
  );
}
