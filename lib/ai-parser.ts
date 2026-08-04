export type Section = { id: string; type: string; title?: string; content: string };

const HEADER_MAP: { [key: string]: RegExp } = {
  definition: /^(?:#+\s*)?definition[:\-\s]/im,
  classification: /^(?:#+\s*)?classification[:\-\s]/im,
  clinical: /^(?:#+\s*)?(clinical picture|presentation|clinical features)[:\-\s]/im,
  diagnosis: /^(?:#+\s*)?(diagnosis|investigations|workup)[:\-\s]/im,
  treatment: /^(?:#+\s*)?(treatment|management|therapy)[:\-\s]/im,
  followup: /^(?:#+\s*)?(follow[- ]?up|prognosis)[:\-\s]/im,
  references: /^(?:#+\s*)?references?[:\-\s]/im,
};

export function parseToSections(text: string): Section[] {
  const lines = text.split(/\r?\n/);
  const sections: Section[] = [];
  let current: { type: string; title?: string; content: string } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      // paragraph break
      if (current) {
        current.content += '\n\n';
      }
      continue;
    }

    let matched = false;
    for (const [type, rx] of Object.entries(HEADER_MAP)) {
      if (rx.test(line)) {
        // start new section
        if (current) {
          sections.push({ id: `${sections.length}-${current.type}`, type: current.type, title: current.title, content: current.content.trim() });
        }
        const titleMatch = line.replace(rx, '').trim();
        current = { type, title: titleMatch || type, content: '' };
        matched = true;
        break;
      }
    }

    if (!matched) {
      if (!current) {
        current = { type: 'additional', content: line };
      } else {
        current.content += (current.content ? '\n' : '') + line;
      }
    }
  }

  if (current) {
    sections.push({ id: `${sections.length}-${current.type}`, type: current.type, title: current.title, content: current.content.trim() });
  }

  // merge tiny sections
  for (let i = sections.length - 1; i > 0; i--) {
    if (sections[i].content.length < 80) {
      sections[i - 1].content += '\n\n' + sections[i].content;
      sections.splice(i, 1);
    }
  }

  return sections;
}
