import type { FC, MouseEvent } from 'react';
import { ExternalLink } from 'lucide-react';

interface FooterProps {
  charCount?: number;
  hasScraped?: boolean;
}

export const Footer: FC<FooterProps> = ({ charCount = 0 }) => {
  const githubRepoUrl = 'https://github.com/DevAbdul-rehman/SAWR-extension';

  const handleOpenLink = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: githubRepoUrl });
    } else {
      window.open(githubRepoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="widget-bottom-bar">
      <div className="footer-left">
        <a
          href={githubRepoUrl}
          onClick={handleOpenLink}
          className="footer-link"
          title="Open Project on GitHub"
        >
          <span>SAWR v1.2.0</span>
          <ExternalLink size={11} />
        </a>
        <span className="footer-separator">•</span>
        <span className="footer-chars">{charCount.toLocaleString()} chars</span>
      </div>
      <div className="footer-right"></div>
    </div>
  );
};