import { fitImageDimensions } from './files.js';

export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('The browser could not read this image. Try another file.')); };
    image.src = url;
  });
}

export function createImageCanvas(image, options) {
  const { width, height, fit = 'stretch', background = '#ffffff', zoom = 1, positionX = 0.5, positionY = 0.5 } = options;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width);
  canvas.height = Math.round(height);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas image processing is not available in this browser.');
  if (background === 'transparent') context.clearRect(0, 0, canvas.width, canvas.height);
  else { context.fillStyle = background; context.fillRect(0, 0, canvas.width, canvas.height); }

  if (fit === 'stretch') {
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
  } else {
    const layout = fitImageDimensions(image.naturalWidth, image.naturalHeight, canvas.width, canvas.height, fit);
    const scale = fit === 'fill' ? zoom : 1;
    const drawWidth = layout.width * scale;
    const drawHeight = layout.height * scale;
    const drawX = fit === 'fill' ? (canvas.width - drawWidth) * positionX : layout.x;
    const drawY = fit === 'fill' ? (canvas.height - drawHeight) * positionY : layout.y;
    context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  }
  return canvas;
}

export function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not export this image in the selected format.')), mime, quality);
  });
}

export async function createImageBlob(image, options) {
  const canvas = createImageCanvas(image, options);
  const quality = options.quality ?? 0.88;
  const mime = options.mime ?? 'image/jpeg';
  if (options.targetKB && mime !== 'image/png') {
    let blob = await canvasToBlob(canvas, mime, quality);
    let q = quality;
    while (blob.size > options.targetKB * 1024 && q > 0.2) {
      q = Math.max(0.2, q - 0.08);
      blob = await canvasToBlob(canvas, mime, q);
    }
    return { blob, canvas, quality: q, targetMet: blob.size <= options.targetKB * 1024 };
  }
  const blob = await canvasToBlob(canvas, mime, mime === 'image/png' ? undefined : quality);
  return { blob, canvas, quality, targetMet: !options.targetKB || blob.size <= options.targetKB * 1024 };
}

export function actualReduction(before, after) {
  if (!before) return 0;
  return Math.round((1 - after / before) * 100);
}
