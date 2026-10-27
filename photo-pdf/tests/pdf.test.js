import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import { addPageNumbers, addText, extractPages, fillPdfForm, mergePdfs, rotatePdf, transformPages, watermarkPdf } from '../src/utils/pdfTools.js';

async function makePdf(pageCount, name = 'fixture.pdf') {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i += 1) doc.addPage([300 + i * 10, 400]);
  const bytes = await doc.save();
  return { name, size: bytes.byteLength, arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) };
}

async function readPageCount(bytes) {
  return (await PDFDocument.load(bytes)).getPageCount();
}

test('PDF merge, extract, remove, rotate, and numbering produce readable documents', async () => {
  const first = await makePdf(2, 'first.pdf');
  const second = await makePdf(1, 'second.pdf');
  const merged = await mergePdfs([first, second]);
  assert.equal(await readPageCount(merged), 3);

  const extracted = await extractPages(first, [1]);
  assert.equal(await readPageCount(extracted), 1);

  const removed = await transformPages(first, { remove: [0] });
  assert.equal(await readPageCount(removed), 1);
  await assert.rejects(() => transformPages(first, { remove: [0, 1] }), /At least one page/);

  const rotated = await rotatePdf(first, 90);
  const rotatedDoc = await PDFDocument.load(rotated);
  assert.equal(rotatedDoc.getPage(0).getRotation().angle, 90);

  const numbered = await addPageNumbers(first, { position: 'bottom-center', size: 12, margin: 24, color: '#111827', style: 'page-of-total' });
  assert.equal(await readPageCount(numbered), 2);
});

test('PDF text, watermark, and standard form updates produce readable output', async () => {
  const original = await PDFDocument.create();
  const page = original.addPage([300, 400]);
  const form = original.getForm();
  form.createTextField('Applicant').addToPage(page, { x: 24, y: 340, width: 180, height: 24 });
  form.createCheckBox('Confirmed').addToPage(page, { x: 24, y: 300, width: 16, height: 16 });
  const bytes = await original.save();
  const file = { name: 'form.pdf', size: bytes.byteLength, arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) };

  const withText = await addText(file, 'Review copy', 1, { size: 12, x: 24, y: 240 });
  assert.equal(await readPageCount(withText), 1);
  await assert.rejects(() => addText(file, 'Out of range', 2), /Choose a page/);

  const withWatermark = await watermarkPdf(file, 'DRAFT');
  assert.equal(await readPageCount(withWatermark), 1);

  const filled = await fillPdfForm(file, { Applicant: 'Example', Confirmed: true });
  const filledDoc = await PDFDocument.load(filled);
  assert.equal(filledDoc.getForm().getTextField('Applicant').getText(), 'Example');
  assert.equal(filledDoc.getForm().getCheckBox('Confirmed').isChecked(), true);
});
