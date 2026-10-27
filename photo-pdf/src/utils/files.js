export const MAX_FILE_BYTES = 100 * 1024 * 1024;

export function validateFiles(files, { accept = [], multiple = false } = {}) {
  if (!files.length) throw new Error('Choose a file to continue.');
  if (!multiple && files.length > 1) throw new Error('Choose one file.');
  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) throw new Error(`${file.name} is larger than the 100 MB per-file limit.`);
    if (accept.length && !accept.some((type) => file.type === type || (type.endsWith('/*') && file.type.startsWith(type.slice(0, -1))))) {
      throw new Error(`${file.name} is not a supported file type.`);
    }
  }
  return files;
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function cleanFilename(name, suffix, extension) {
  const base = name.replace(/\.[^.]+$/, '').replace(/[\\/:*?"<>|]/g, '-').slice(0, 100) || 'file';
  return `${base}${suffix}.${extension}`;
}

export function safeDownloadName(value, originalName) {
  const dot = originalName.lastIndexOf('.');
  const extension = dot > 0 ? originalName.slice(dot) : '';
  const originalBase = dot > 0 ? originalName.slice(0, dot) : originalName;
  let base = String(value ?? '').trim().replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-').replace(/^\.+/, '').replace(/\.+$/, '');
  if (extension && base.toLowerCase().endsWith(extension.toLowerCase())) base = base.slice(0, -extension.length);
  return `${base.slice(0, 100) || originalBase}${extension}`;
}

export function parsePageRanges(value, totalPages) {
  const groups = value.split(',').map((part) => part.trim()).filter(Boolean).map((part) => {
    const match = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) throw new Error(`Invalid page range: ${part}`);
    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : start;
    if (start < 1 || end < start || end > totalPages) throw new Error(`Page range ${part} must be between 1 and ${totalPages}.`);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index - 1);
  });
  if (!groups.length) throw new Error('Enter pages, for example 1-3, 5.');
  const flattened = groups.flat();
  if (new Set(flattened).size !== flattened.length) throw new Error('A page is listed more than once.');
  return groups;
}

export function parsePageOrder(value, totalPages) {
  const pages = parsePageRanges(value, totalPages).flat();
  if (pages.length !== totalPages || new Set(pages).size !== totalPages) {
    throw new Error(`List all ${totalPages} pages exactly once to set a new order.`);
  }
  return pages;
}

export function fitImageDimensions(sourceWidth, sourceHeight, targetWidth, targetHeight, mode = 'fit') {
  if (![sourceWidth, sourceHeight, targetWidth, targetHeight].every((value) => Number.isFinite(value) && value > 0)) {
    throw new Error('Image dimensions must be positive numbers.');
  }
  if (mode === 'stretch') return { width: targetWidth, height: targetHeight, x: 0, y: 0 };
  const scale = mode === 'fill'
    ? Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight)
    : Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  return { width, height, x: (targetWidth - width) / 2, y: (targetHeight - height) / 2 };
}

export function heightForAspect(width, numerator, denominator) {
  if (![width, numerator, denominator].every((value) => Number.isFinite(Number(value)) && Number(value) > 0)) {
    throw new Error('Width and aspect ratio values must be positive numbers.');
  }
  return Math.round(Number(width) * Number(denominator) / Number(numerator));
}
