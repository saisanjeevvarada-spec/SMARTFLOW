import React, { useState } from "react";

export default function PasswordInput({
  label,
  name,
  placeholder,
  hint,
  value,
  onChange,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}

      <div className="password-wrapper">
        <input
          className="input"
          type={showPassword ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="current-password"
          {...props}
        />

        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "🙈" : "👁"}
        </button>
      </div>
      {hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}