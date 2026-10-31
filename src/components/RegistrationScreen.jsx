import React, { useState } from "react";
import { User, Phone, Sparkles, ArrowRight, ShieldAlert, AlertCircle } from "lucide-react";
import { apiService } from "../services/apiService";

export function RegistrationScreen({ onRegisterSuccess, systemNotice }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleMobileChange = (e) => {
    // Only allow numbers, max 10 digits
    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10);
    setMobile(cleaned);
    if (errorMsg) setErrorMsg("");
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setErrorMsg("Please enter your name to begin.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await apiService.register(trimmedName, mobile);
      if (res.success) {
        onRegisterSuccess(res.player, res.token, res.notice);
      } else {
        setErrorMsg(res.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setErrorMsg("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-screen-container">
      <div className="reg-card">
        <div className="reg-badge">
          <Sparkles size={15} />
          <span>NOVEMBER 1 • KERALA PIRAVI</span>
        </div>

        <h1 className="reg-title">Kerala Piravi Jigsaw Challenge</h1>
        <p className="reg-subtitle">
          Reconstruct the portraits of Kerala's legendary icons. Simple phone registration to save your progress!
        </p>

        {systemNotice && (
          <div className="system-notice-banner" style={{ marginBottom: 16, borderRadius: 10 }}>
            <AlertCircle size={16} />
            <span>{systemNotice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="reg-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">
              <User size={15} /> Player Name
            </label>
            <div className="form-input-wrap">
              <User size={18} className="input-icon" />
              <input
                id="reg-name"
                type="text"
                placeholder="Enter your name"
                className="form-input"
                value={name}
                onChange={handleNameChange}
                maxLength={40}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-mobile">
              <Phone size={15} /> Indian Mobile Number
            </label>
            <div className="form-input-wrap">
              <Phone size={18} className="input-icon" />
              <span className="mobile-prefix">+91</span>
              <input
                id="reg-mobile"
                type="tel"
                placeholder="10-digit number"
                className="form-input with-prefix"
                value={mobile}
                onChange={handleMobileChange}
                inputMode="numeric"
                required
              />
            </div>
          </div>

          {errorMsg && (
            <div className="form-error-msg">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span>Connecting to Backend...</span>
            ) : (
              <>
                <span>Enter Game</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <p className="form-security-note">
            <ShieldAlert size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
            Phone-only registration. No OTP or password required. Session saves locally and syncs to Google Sheets.
          </p>
        </form>
      </div>
    </div>
  );
}

