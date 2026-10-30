import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';

export async function exportQuizToDocx(markdownText: string, domain: string): Promise<void> {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const lines = markdownText.split('\n');
  const bodyParagraphs: Paragraph[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      bodyParagraphs.push(new Paragraph({ text: '' }));
      continue;
    }

    if (trimmed.startsWith('# ')) {
      bodyParagraphs.push(
        new Paragraph({
          text: trimmed.replace(/^#\s+/, ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (trimmed.startsWith('## ')) {
      bodyParagraphs.push(
        new Paragraph({
          text: trimmed.replace(/^##\s+/, ''),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (trimmed.startsWith('### ')) {
      bodyParagraphs.push(
        new Paragraph({
          text: trimmed.replace(/^###\s+/, ''),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 },
        })
      );
    } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const content = trimmed.replace(/^(\*|-)\s+/, '');
      bodyParagraphs.push(
        new Paragraph({
          children: parseInlineFormatting(content),
          bullet: { level: 0 },
          spacing: { after: 80 },
        })
      );
    } else {
      bodyParagraphs.push(
        new Paragraph({
          children: parseInlineFormatting(trimmed),
          spacing: { after: 120 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'SAWR — Smart AI Website Reader',
                bold: true,
                size: 32,
                color: '0284C7',
                font: 'Segoe UI',
              }),
            ],
            spacing: { after: 60 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Automated Study Material & Assessment Generator',
                italics: true,
                size: 20,
                color: '64748B',
                font: 'Segoe UI',
              }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            border: {
              bottom: {
                color: '38BDF8',
                space: 4,
                style: BorderStyle.SINGLE,
                size: 12,
              },
            },
            children: [
              new TextRun({
                text: `Extracted Source: ${domain}`,
                bold: true,
                size: 18,
                color: '0369A1',
                font: 'Segoe UI',
              }),
              new TextRun({
                text: `  |  Generated: ${currentDate}`,
                size: 18,
                color: '64748B',
                font: 'Segoe UI',
              }),
            ],
            spacing: { after: 280 },
          }),
          ...bodyParagraphs,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `SAWR_Notes_${domain.replace(/[^a-z0-9]/gi, '_')}.docx`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function parseInlineFormatting(text: string): TextRun[] {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.filter(Boolean).map((part) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return new TextRun({
        text: part.slice(2, -2),
        bold: true,
        font: 'Segoe UI',
      });
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return new TextRun({
        text: part.slice(1, -1),
        italics: true,
        font: 'Segoe UI',
      });
    }
    return new TextRun({
      text: part,
      font: 'Segoe UI',
    });
  });
}