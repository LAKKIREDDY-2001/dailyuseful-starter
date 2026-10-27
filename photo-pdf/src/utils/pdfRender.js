import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import JSZip from 'jszip';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export async function renderPdfThumbnails(file, limit = 12) {
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  const pdf = await task.promise;
  const thumbnails = [];
  try {
    for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, limit); pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: Math.min(0.34, 150 / page.getViewport({ scale: 1 }).width) });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await page.render({ canvasContext: canvas.getContext('2d'), viewport, background: '#ffffff' }).promise;
      thumbnails.push(canvas.toDataURL('image/png'));
      canvas.width = 0;
      canvas.height = 0;
      page.cleanup();
    }
    return { thumbnails, totalPages: pdf.numPages };
  } finally {
    await task.destroy();
  }
}

export async function pdfToJpgFiles(file, { quality = 0.9, scale = 1.5, onProgress } = {}) {
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  const pdf = await task.promise;
  const zip = new JSZip();
  const files = [];
  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
      await page.render({ canvasContext: canvas.getContext('2d', { alpha: false }), viewport, background: '#ffffff' }).promise;
      const blob = await new Promise((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error(`Could not export page ${pageNumber}.`)), 'image/jpeg', quality));
      const name = `page-${String(pageNumber).padStart(3, '0')}.jpg`;
      zip.file(name, blob); files.push({ name, blob });
      canvas.width = 0; canvas.height = 0; page.cleanup();
      onProgress?.(pageNumber, pdf.numPages);
    }
  } catch (error) {
    throw error;
  } finally {
    await task.destroy();
  }
  const archive = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  files.push({ name: 'pdf-pages.zip', blob: archive });
  return files;
}

export async function pdfTextByPage(file) {
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  const pdf = await task.promise;
  const pages = [];
  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => item.str).filter(Boolean).join(' '));
      page.cleanup();
    }
    return pages;
  } finally {
    await task.destroy();
  }
}
