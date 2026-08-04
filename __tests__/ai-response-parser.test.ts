import { parseToSections } from '../lib/ai-parser';

test('parses markdown headings to sections', () => {
  const input = `Definition: Short definition\n\nTreatment: Do X and Y\n\nReferences: [1] Guide`;
  const out = parseToSections(input);
  expect(out.length).toBeGreaterThanOrEqual(2);
  expect(out.find(s => s.type === 'definition')).toBeTruthy();
  expect(out.find(s => s.type === 'treatment')).toBeTruthy();
});
