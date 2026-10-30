import type { FC } from 'react';

export const AboutView: FC = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h2 className="about-main-title">About SAWR Agent</h2>
        <p className="about-description">
          Smart AI Website Reader (SAWR) is an intelligent browser copilot designed for university Computer Science coursework and technical documentation analysis.
        </p>
      </div>

      <div className="about-card">
        <h3 className="about-card-title">Tech Stack</h3>
        <ul className="about-card-list">
          <li><strong>Frontend:</strong> React 18, TypeScript, Vite</li>
          <li><strong>AI Engine:</strong> Google Gen AI SDK (gemini-2.0-flash & gemini-2.5-flash)</li>
          <li><strong>Styling & Icons:</strong> Lucide Icons, Custom Scoped CSS</li>
          <li><strong>Document Engine:</strong> docx OpenXML Generator</li>
        </ul>
      </div>

      <div className="about-card">
        <h3 className="about-card-title">Academic Project Info</h3>
        <div className="about-card-text">
          <p><strong>Course:</strong> Advanced Web Development (AWD)</p>
          <p><strong>Purpose:</strong> Contextual reading, interactive student testing, hint-based coaching, and weak area remediation.</p>
        </div>
      </div>
    </div>
  );
};

export default AboutView;