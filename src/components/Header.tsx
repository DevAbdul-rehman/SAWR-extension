import type { FC } from 'react';
import { RotateCcw } from 'lucide-react';

export type ExplanationMode = 'Beginner' | 'Intermediate' | 'Advanced';

interface HeaderProps {
  pageHostname: string;
  hasScraped: boolean;
  mode: ExplanationMode;
  onModeChange: (m: ExplanationMode) => void;
  onReset: () => void;
}

export const Header: FC<HeaderProps> = ({
  pageHostname,
  hasScraped,
  mode,
  onModeChange,
  onReset,
}) => {
  const modes: ExplanationMode[] = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="widget-header">
      <div className="header-brand-row">
        <div className="brand-logo-badge">
          <img
            src="/sawr-logo.png"
            alt="SAWR Logo"
            className="brand-logo-img"
          />
        </div>
        <div className="brand-titles">
          <span className="brand-title">SAWR</span>
          <span className="header-status">
            <span className={`status-dot ${hasScraped ? 'active' : ''}`} />
            {hasScraped ? `Active: ${pageHostname}` : `Idle: ${pageHostname || 'Ready'}`}
          </span>
        </div>
      </div>

      <div className="header-controls">
        <div className="mode-toggle-group">
          {modes.map((m) => (
            <button
              key={m}
              type="button"
              className={`mode-btn ${mode === m ? 'active' : ''}`}
              onClick={() => onModeChange(m)}
            >
              {m.slice(0, 3)}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="reset-btn"
          onClick={onReset}
          title="Reset Session"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
};