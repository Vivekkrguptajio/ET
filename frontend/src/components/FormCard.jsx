import './FormCard.css';

export default function FormCard({ title, subtitle, children, onSubmit, submitText = 'Analyze with AI', loading = false }) {
  return (
    <div className="form-card card" id="form-card">
      <div className="form-header">
        <h2 className="form-title">{title}</h2>
        {subtitle && <p className="form-subtitle">{subtitle}</p>}
      </div>
      <form className="form-body" onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }}>
        <div className="form-grid">
          {children}
        </div>
        <button
          type="submit"
          className={`btn-primary btn-large form-submit ${loading ? 'loading' : ''}`}
          id="form-submit-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Analyzing...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z"/>
              </svg>
              {submitText}
            </>
          )}
        </button>
      </form>
    </div>
  );
}

/* Reusable FormField component */
export function FormField({ label, id, type = 'text', placeholder, value, onChange, options, required = false, prefix, suffix }) {
  return (
    <div className="form-field" id={`field-${id}`}>
      <label className="label" htmlFor={id}>{label}</label>
      <div className="input-wrapper">
        {prefix && <span className="input-prefix">{prefix}</span>}
        {type === 'select' ? (
          <select
            className="input-field"
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
          >
            <option value="" disabled>{placeholder || 'Select...'}</option>
            {options?.map((opt) => (
              <option key={opt.value ?? opt} value={opt.value ?? opt}>
                {opt.label ?? opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            className="input-field"
            type={type}
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
          />
        )}
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
    </div>
  );
}
