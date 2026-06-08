export function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <p className="dialog-message">{message}</p>
        <div className="dialog-actions">
          <button type="button" className="btn btn-dialog-cancel" onClick={onCancel}>
            Annuleren
          </button>
          <button type="button" className="btn btn-dialog-confirm" onClick={onConfirm}>
            Verwijderen
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
