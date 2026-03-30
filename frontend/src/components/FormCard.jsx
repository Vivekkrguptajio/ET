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
