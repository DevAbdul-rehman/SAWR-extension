import type { FC } from 'react';
import { Mail, Trash2 } from 'lucide-react';

interface SettingsViewProps {
  pageHostname: string;
  hasScraped: boolean;
  onReset: () => void;
}

export const SettingsView: FC<SettingsViewProps> = ({
  pageHostname,
  hasScraped,
  onReset,
}) => {
const MY_EMAIL = 'chromatic753@gmail.com';
  const mailtoUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${MY_EMAIL}&su=SAWR%20Feedback%20%26%20Suggestions&body=Hi%20there,%0D%0A%0D%0AHere%20is%20my%20feedback%20or%20suggestion%20for%20SAWR:%0D%0A%0D%0A`;
  const handleOpenEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: mailtoUrl });
    } else {
      window.open(mailtoUrl, '_blank');
    }
  };

  return (
    <div className="settings-container">
      {/* Active Domain Session */}
      <div className="settings-card">
        <h3 className="settings-card-title">Active Domain Session</h3>
        <div className="settings-row">
          <span className="settings-label">Current Host:</span>
          <code className="settings-code">{pageHostname || 'None'}</code>
        </div>
        <p className="settings-status-text">
          Status: {hasScraped ? 'Active / Parsed' : 'Idle / Not scraped'}
        </p>
        <button
          type="button"
          className="settings-danger-btn"
          onClick={onReset}
        >
          <Trash2 size={13} />
          <span>Clear Domain Cache & Reset</span>
        </button>
      </div>

      {/* Multi-Key Engine */}
      <div className="settings-card">
        <h3 className="settings-card-title">Multi-Key Engine</h3>
        <div className="settings-row">
          <span className="settings-label">Model Cascade:</span>
          <code className="settings-code">gemini-2.0-flash</code>
          <span className="text-slate-500 text-[11px]">→</span>
        </div>
        <div className="settings-row center-row">
          <code className="settings-code">gemini-2.5-flash</code>
        </div>
        <p className="settings-hint">
          Quota Failover: Active (Automatic multi-key failover on 429)
        </p>
      </div>

      {/* Support & Feedback Section */}
      <div className="settings-card">
        <h3 className="settings-card-title">Support & Feedback</h3>
        <p className="settings-feedback-desc">
          Have an idea, bug report, or feature suggestion for SAWR? Feel free to reach out directly:
        </p>
        <a
          href={mailtoUrl}
          onClick={handleOpenEmail}
          className="settings-feedback-btn"
        >
          <Mail size={13} />
          <span>Send Feedback & Review</span>
        </a>
        <div className="settings-email-display">
          <span>Direct email:</span>
          <code>{MY_EMAIL}</code>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;