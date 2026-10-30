import React from 'react';

export const FaqView: React.FC = () => (
  <div className="tab-page-container">
    <h3>Frequently Asked Questions</h3>

    <div className="faq-item">
      <h5>How does "Read This Page" work?</h5>
      <p>It sanitizes the document by removing scripts, styling, navigation bars, and footers, extracting clean text context up to 70,000 characters for the AI.</p>
    </div>

    <div className="faq-item">
      <h5>What is Programming Hint Mode?</h5>
      <p>It provides algorithmic pointers, pseudo-code structures, and edge-case reminders without spoon-feeding the final code solution.</p>
    </div>

    <div className="faq-item">
      <h5>How do the explanation modes differ?</h5>
      <p><strong>BEG:</strong> Uses real-world analogies and avoids heavy jargon.<br /><strong>INT:</strong> Focuses on standard conventions and practical implementations.<br /><strong>ADV:</strong> Deep dives into runtime complexity, space trade-offs, and memory design.</p>
    </div>

    <div className="faq-item">
      <h5>How does Word Export work?</h5>
      <p>Click "Export Quiz / Q&A to .docx" to download a clean, formatted Word file with your questions, answer keys, or study plan.</p>
    </div>
  </div>
);