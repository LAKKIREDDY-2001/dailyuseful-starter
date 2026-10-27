import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';

export async function loadPdf(file) {
  try {
    return await PDFDocument.load(await file.arrayBuffer());
  } catch {
    throw new Error('This PDF could not be read. It may be damaged, encrypted, or unsupported.');
  }
}

export async function mergePdfs(files) {
  const output = await PDFDocument.create();
  for (const file of files) {
    const source = await loadPdf(file);
    const copied = await output.copyPages(source, source.getPageIndices());
    copied.forEach((page) => output.addPage(page));
  }
  return output.save({ useObjectStreams: true });
}

export async function extractPages(file, indices) {
  if (!indices.length) throw new Error('Keep at least one page in the output.');
  const source = await loadPdf(file);
  const output = await PDFDocument.create();
  const copied = await output.copyPages(source, indices);
  copied.forEach((page) => output.addPage(page));
  return output.save({ useObjectStreams: true });
}

export async function transformPages(file, { order, remove = [], rotate = 0, cropPercent = 0 }) {
  const source = await loadPdf(file);
  const removed = new Set(remove);
  const indices = (order || source.getPageIndices()).filter((index) => !removed.has(index));
  if (!indices.length) throw new Error('At least one page must remain.');
  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, indices);
  pages.forEach((page, index) => {
    if (rotate) page.setRotation(degrees((page.getRotation().angle + rotate + 360) % 360));
    if (cropPercent) {
      const { width, height, x, y } = page.getCropBox();
      const insetX = width * cropPercent / 100;
      const insetY = height * cropPercent / 100;
      page.setCropBox(x + insetX, y + insetY, width - insetX * 2, height - insetY * 2);
    }
    output.addPage(page);
  });
  return output.save({ useObjectStreams: true });
}

export async function rotatePdf(file, angle) {
  const doc = await loadPdf(file);
  doc.getPages().forEach((page) => page.setRotation(degrees((page.getRotation().angle + angle + 360) % 360)));
  return doc.save({ useObjectStreams: true });
}

export async function addPageNumbers(file, options) {
  const doc = await loadPdf(file);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const color = parseColor(options.color);
  doc.getPages().forEach((page, index) => {
    const { width, height } = page.getSize();
    let x = options.margin;
    let y = options.margin;
    if (options.position.includes('right')) x = width - options.margin - options.textWidth;
    if (options.position.includes('center')) x = (width - options.textWidth) / 2;
    if (options.position.startsWith('top')) y = height - options.margin - options.size;
    const text = options.style === 'page-of-total' ? `${index + 1} / ${doc.getPageCount()}` : String(index + 1);
    const textWidth = font.widthOfTextAtSize(text, options.size);
    if (options.position.includes('right')) x = width - options.margin - textWidth;
    if (options.position.includes('center')) x = (width - textWidth) / 2;
    page.drawText(text, { x, y, size: options.size, font, color });
  });
  return doc.save({ useObjectStreams: true });
}

export async function addText(file, text, pageNumber, options = {}) {
  const doc = await loadPdf(file);
  const pages = doc.getPages();
  if (pageNumber < 1 || pageNumber > pages.length) throw new Error(`Choose a page from 1 to ${pages.length}.`);
  const page = pages[pageNumber - 1];
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText(text, { x: options.x ?? 48, y: options.y ?? 48, size: options.size ?? 16, font, color: parseColor(options.color) });
  return doc.save({ useObjectStreams: true });
}

export async function watermarkPdf(file, text, options = {}) {
  const doc = await loadPdf(file);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  doc.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const size = options.size ?? 34;
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - textWidth) / 2, y: height / 2, size, font, color: parseColor(options.color), opacity: 0.25, rotate: degrees(-35) });
  });
  return doc.save({ useObjectStreams: true });
}

export async function signPdf(file, imageFile, pageNumber, options = {}) {
  const doc = await loadPdf(file);
  const page = doc.getPages()[pageNumber - 1];
  if (!page) throw new Error(`Choose a page from 1 to ${doc.getPageCount()}.`);
  const bytes = await imageFile.arrayBuffer();
  const image = imageFile.type === 'image/png' ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
  const { width, height } = page.getSize();
  const targetWidth = options.width ?? 140;
  const scaled = image.scale(targetWidth / image.width);
  page.drawImage(image, { x: width - targetWidth - 40, y: 42, width: targetWidth, height: scaled.height });
  return doc.save({ useObjectStreams: true });
}

export async function pdfFormFields(file) {
  const doc = await loadPdf(file);
  let form;
  try { form = doc.getForm(); } catch { return { doc, fields: [] }; }
  return { doc, fields: form.getFields().map((field) => ({ name: field.getName(), type: field.constructor.name })) };
}

export async function fillPdfForm(file, values) {
  const doc = await loadPdf(file);
  const form = doc.getForm();
  for (const [name, value] of Object.entries(values)) {
    const field = form.getField(name);
    if (field.constructor.name.includes('TextField')) field.setText(value);
    else if (field.constructor.name.includes('CheckBox')) value ? field.check() : field.uncheck();
    else if (field.constructor.name.includes('Dropdown') || field.constructor.name.includes('OptionList')) field.select(value);
    else if (field.constructor.name.includes('RadioGroup')) field.select(value);
  }
  form.updateFieldAppearances();
  return doc.save({ useObjectStreams: true });
}

export async function imagesToPdf(files, { pageSize = 'A4', landscape = false, margin = 24 } = {}) {
  const sizes = { A4: [595.28, 841.89], Letter: [612, 792] };
  const output = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const image = file.type === 'image/png' ? await output.embedPng(bytes) : await output.embedJpg(bytes);
    let [pageWidth, pageHeight] = sizes[pageSize] || sizes.A4;
    if (landscape) [pageWidth, pageHeight] = [pageHeight, pageWidth];
    const page = output.addPage([pageWidth, pageHeight]);
    const scale = Math.min((pageWidth - margin * 2) / image.width, (pageHeight - margin * 2) / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    page.drawImage(image, { x: (pageWidth - width) / 2, y: (pageHeight - height) / 2, width, height });
  }
  return output.save({ useObjectStreams: true });
}

function parseColor(hex = '#111827') {
  const clean = /^#[0-9a-f]{6}$/i.test(hex) ? hex.slice(1) : '111827';
  return rgb(parseInt(clean.slice(0, 2), 16) / 255, parseInt(clean.slice(2, 4), 16) / 255, parseInt(clean.slice(4, 6), 16) / 255);
}
