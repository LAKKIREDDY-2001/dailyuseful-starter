import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Info, RotateCw, ShieldCheck } from 'lucide-react';
import { DownloadResults, UploadArea } from './FileControls.jsx';
import { cleanFilename, formatBytes, heightForAspect } from '../utils/files.js';
import { actualReduction, createImageBlob, loadImage } from '../utils/imageTools.js';

const ratioPresets = ['1:1','4:3','3:4','16:9','9:16','16:4','4:5','3:2','2:3','Custom'];
const formatMap = { JPG: 'image/jpeg', PNG: 'image/png', WebP: 'image/webp' };
const fixedFormat = { 'image-to-jpg': 'JPG', 'image-to-png': 'PNG', 'image-to-webp': 'WebP' };

export default function ImageTool({ tool }) {
  const { id } = tool;
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [result, setResult] = useState(null);
  const [resultUrl, setResultUrl] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const loadGeneration = useRef(0);
  const [settings, setSettings] = useState({
    width: 0, height: 0, locked: true, ratio: '1:1', numerator: 1, denominator: 1,
    fit: 'stretch', zoom: 100, x: 50, y: 50, background: '#ffffff', customColor: '#ffffff',
    format: fixedFormat[id] || 'JPG', quality: 88, targetKB: '', trim: id === 'signature-resizer',
  });
  const format = fixedFormat[id] || settings.format;
  const imageTool = id === 'image-dimensions';
  const ratioTool = ['aspect-ratio','crop-image','exam-photo','passport-photo','signature-resizer'].includes(id);
  const targetTool = ['compress-image','exam-photo','signature-resizer'].includes(id);
  const backgroundTool = ratioTool || id === 'background-color';
  const showQuality = ['compress-image','exam-photo','signature-resizer'].includes(id);
  const isCompression = id === 'compress-image';
  const downloadItems = useMemo(() => result ? [{ name: result.name, blob: result.blob }] : [], [result]);

  useEffect(() => {
    loadGeneration.current += 1;
    setFile(null); setImage(null); setResult(null); setSourceUrl(''); setError(''); setStatus(''); setBusy(false);
    const outputFormat = fixedFormat[id] || (id === 'image-to-png' ? 'PNG' : 'JPG');
    setSettings((current) => ({ ...current, width: 0, height: 0, format: outputFormat, background: outputFormat === 'JPG' ? '#ffffff' : 'transparent', trim: id === 'signature-resizer', ratio: '1:1', fit: ['aspect-ratio','exam-photo','passport-photo','signature-resizer'].includes(id) ? 'fill' : 'stretch' }));
  }, [id]);

  useEffect(() => {
    if (!result) { setResultUrl(''); return undefined; }
    const url = URL.createObjectURL(result.blob);
    setResultUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [result]);

  useEffect(() => () => { if (sourceUrl) URL.revokeObjectURL(sourceUrl); }, [sourceUrl]);

  function update(key, value) { setSettings((current) => ({ ...current, [key]: value })); }
  async function chooseFiles(selected) {
    const next = selected[0];
    const generation = ++loadGeneration.current;
    setError(''); setStatus(''); setResult(null); setSourceUrl(''); setFile(next); setImage(null);
    try {
      const decoded = await loadImage(next);
      if (generation !== loadGeneration.current) return;
      if (decoded.naturalWidth * decoded.naturalHeight > 25000000) throw new Error('This image exceeds 25 megapixels. Choose a smaller image to protect device memory.');
      setImage(decoded);
      setSettings((current) => ({ ...current, width: decoded.naturalWidth, height: decoded.naturalHeight, ratio: 'Custom', numerator: decoded.naturalWidth, denominator: decoded.naturalHeight }));
      setSourceUrl(URL.createObjectURL(next));
    } catch (issue) { if (generation === loadGeneration.current) { setError(issue.message); setFile(null); } }
  }

  function setWidth(value) {
    update('width', value);
    if (settings.locked && Number(value) > 0 && image) update('height', Math.max(1, heightForAspect(Number(value), ratioNumerator(), ratioDenominator())));
  }
  function setHeight(value) {
    update('height', value);
    if (settings.locked && Number(value) > 0 && image) update('width', Math.max(1, Math.round(Number(value) * ratioNumerator() / ratioDenominator())));
  }
  function ratioNumerator() {
    if (settings.ratio === 'Custom') return Math.max(1, Number(settings.numerator) || 1);
    return Number((settings.ratio.split(':')[0] || 1));
  }
  function ratioDenominator() {
    if (settings.ratio === 'Custom') return Math.max(1, Number(settings.denominator) || 1);
    return Number((settings.ratio.split(':')[1] || 1));
  }
  function chooseRatio(value) {
    const parts = value === 'Custom' ? [settings.numerator, settings.denominator] : value.split(':').map(Number);
    update('ratio', value);
    if (image && Number(settings.width) > 0) update('height', Math.max(1, Math.round(Number(settings.width) * parts[1] / parts[0])));
  }

  async function process() {
    if (!image || !file) { setError('Choose an image first.'); return; }
    const width = Number(settings.width), height = Number(settings.height);
    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 12000 || height > 12000 || width * height > 25000000) {
      setError('Enter dimensions up to 12,000 pixels per side and 25 megapixels total.'); return;
    }
    if (settings.ratio === 'Custom' && (!settings.numerator || !settings.denominator || settings.numerator < 1 || settings.denominator < 1)) { setError('Enter a custom ratio with positive values.'); return; }
    if (targetTool && settings.targetKB && (!Number.isFinite(Number(settings.targetKB)) || Number(settings.targetKB) <= 0)) { setError('Enter a target size greater than zero KB.'); return; }
    setBusy(true); setError(''); setResult(null); setStatus('Rendering image locally…');
    try {
      const mime = formatMap[format];
      const source = id === 'signature-resizer' && settings.trim ? trimWhitespace(image) : image;
      const background = mime === 'image/jpeg' && settings.background === 'transparent' ? '#ffffff' : settings.background === 'custom' ? settings.customColor : settings.background;
      const { blob, targetMet } = await createImageBlob(source, {
        width, height, fit: settings.fit, background, zoom: Number(settings.zoom) / 100,
        positionX: Number(settings.x) / 100, positionY: Number(settings.y) / 100,
        quality: Number(settings.quality) / 100, mime, targetKB: Number(settings.targetKB) || 0,
      });
      if (blob.type !== mime) throw new Error(`${format} export is not supported by this browser. Choose another format.`);
      const reduction = actualReduction(file.size, blob.size);
      setResult({ blob, name: cleanFilename(file.name, `-${id}`, format.toLowerCase()), width, height });
      const resultMessage = `Output ${width} × ${height} px · ${formatBytes(blob.size)} · ${reduction > 0 ? `${reduction}% smaller` : reduction < 0 ? `${Math.abs(reduction)}% larger` : 'same size'}.`;
      const targetMessage = format === 'PNG' ? 'Target size not reached with this lossless format.' : 'Target size could not be reached at the minimum quality.';
      setStatus(targetTool && settings.targetKB ? `${resultMessage} ${targetMet ? 'Target reached.' : targetMessage}` : resultMessage);
    } catch (issue) { setError(issue.message || 'Could not process this image. Try a smaller file.'); setStatus(''); }
    finally { setBusy(false); }
  }

  const controls = useMemo(() => {
    if (!image) return null;
    const fields = [];
    fields.push(<label className="field" key="format">Output format<select value={format} onChange={(event) => { update('format', event.target.value); update('background', event.target.value === 'JPG' ? '#ffffff' : 'transparent'); }} disabled={Boolean(fixedFormat[id])}><option>JPG</option><option>PNG</option><option>WebP</option></select></label>);
    if (id === 'image-dimensions') return <div className="dimension-report"><div><span>Width</span><b>{image.naturalWidth.toLocaleString()} px</b></div><div><span>Height</span><b>{image.naturalHeight.toLocaleString()} px</b></div><div><span>Aspect ratio</span><b>{reduceRatio(image.naturalWidth, image.naturalHeight)}</b></div><div><span>Original file</span><b>{formatBytes(file.size)}</b></div></div>;
    if (ratioTool) fields.push(<label className="field" key="ratio">Aspect ratio preset<select value={settings.ratio} onChange={(event) => chooseRatio(event.target.value)}>{ratioPresets.map((item) => <option key={item}>{item}</option>)}</select></label>);
    if (ratioTool && settings.ratio === 'Custom') fields.push(<div className="field-row" key="custom-ratio"><label className="field">Ratio width<input type="number" min="1" value={settings.numerator} onChange={(event) => { update('numerator', Number(event.target.value)); if (image && settings.width) update('height', Math.round(settings.width * settings.denominator / Number(event.target.value))); }}/></label><label className="field">Ratio height<input type="number" min="1" value={settings.denominator} onChange={(event) => { update('denominator', Number(event.target.value)); if (image && settings.width) update('height', Math.round(settings.width * Number(event.target.value) / settings.numerator)); }}/></label></div>);
    fields.push(<div className="field-row" key="dimensions"><label className="field">Width (px)<input type="number" min="1" max="12000" value={settings.width} onChange={(event) => setWidth(event.target.value)}/></label><label className="field">Height (px)<input type="number" min="1" max="12000" value={settings.height} onChange={(event) => setHeight(event.target.value)}/></label></div>);
    if (ratioTool || id === 'resize-image') fields.push(<label className="check-row" key="ratio-lock"><input type="checkbox" checked={settings.locked} onChange={(event) => update('locked', event.target.checked)}/> Maintain aspect ratio</label>);
    if (ratioTool) fields.push(<label className="field" key="fit">Frame mode<select value={settings.fit} onChange={(event) => update('fit', event.target.value)}><option value="fit">Fit — show the full image</option><option value="fill">Fill / crop — fill the frame</option><option value="stretch">Stretch — distort to dimensions</option></select></label>);
    if (settings.fit === 'fill' && ratioTool) {
      fields.push(<label className="field" key="zoom">Zoom: {settings.zoom}%<input type="range" min="100" max="300" value={settings.zoom} onChange={(event) => update('zoom', Number(event.target.value))}/></label>);
      fields.push(<div className="field-row" key="position"><label className="field">Horizontal position: {settings.x}%<input type="range" min="0" max="100" value={settings.x} onChange={(event) => update('x', Number(event.target.value))}/></label><label className="field">Vertical position: {settings.y}%<input type="range" min="0" max="100" value={settings.y} onChange={(event) => update('y', Number(event.target.value))}/></label></div>);
    }
    if (backgroundTool) fields.push(<div className="field-row" key="background"><label className="field">Canvas background<select value={settings.background === 'custom' ? 'custom' : settings.background} onChange={(event) => update('background', event.target.value)}><option value="#ffffff">White</option><option value="#000000">Black</option><option value="custom">Custom color</option><option value="transparent">Transparent (PNG/WebP)</option></select></label>{settings.background === 'custom' && <label className="field">Choose color<input type="color" value={settings.customColor} onChange={(event) => update('customColor', event.target.value)}/></label>}</div>);
    if (showQuality) fields.push(<label className="field" key="quality">Quality: {settings.quality}%<input type="range" min="20" max="100" value={settings.quality} onChange={(event) => update('quality', Number(event.target.value))}/></label>);
    if (targetTool) fields.push(<label className="field" key="target">Target size (KB, optional)<input type="number" min="1" max="10000" value={settings.targetKB} onChange={(event) => update('targetKB', event.target.value)} placeholder="For example, 100"/><small>For lossy JPG/WebP output, FileFix lowers quality and reports whether the measured target was reached.</small></label>);
    if (id === 'signature-resizer') fields.push(<label className="check-row" key="trim"><input type="checkbox" checked={settings.trim} onChange={(event) => update('trim', event.target.checked)}/> Trim transparent and near-white edge space</label>);
    if (isCompression) fields.push(<p className="field-hint" key="tip">Compression can make a file larger. FileFix reports the measured result and never promises a target it did not reach.</p>);
    return <div className="image-controls">{fields}</div>;
  }, [id, image, file, settings, format, ratioTool, backgroundTool, showQuality, targetTool, isCompression]);

  return <section className="workspace panel">
    <div className="workspace-intro"><div><span className="eyebrow">BROWSER IMAGE TOOL</span><h2>{image ? 'Adjust your output' : 'Choose an image'}</h2><p>JPG, PNG, WebP, and other images your browser can decode · max 100 MB and 25 megapixels.</p></div><span className="local-badge"><ShieldCheck/> Local</span></div>
    <UploadArea accept={['image/*']} label="Choose an image" help="JPG, PNG, WebP and browser-supported images · up to 100 MB" onFiles={chooseFiles} onError={setError}/>
    {file && image && <div className="image-preview-grid"><figure><img src={sourceUrl} alt={`Original ${file.name}`}/><figcaption>Original · {image.naturalWidth} × {image.naturalHeight} px · {formatBytes(file.size)}</figcaption></figure>{resultUrl && <figure><img src={resultUrl} alt="Processed image preview"/><figcaption>Output · {result.width} × {result.height} px · {formatBytes(result.blob.size)}</figcaption></figure>}</div>}
    {controls && <div className="tool-controls">{controls}</div>}
    {error && <p className="error-message" role="alert">{error}</p>}{status && <p className="status-message" role="status" aria-live="polite">{status}</p>}
    {!imageTool && <div className="workspace-actions"><button className="button primary" type="button" disabled={!image || busy} onClick={process}>{busy ? 'Processing…' : id === 'compress-image' ? 'Compress image' : 'Create image'} <RotateCw size={16}/></button><button className="button secondary" type="button" disabled={busy} onClick={() => { loadGeneration.current += 1; setImage(null); setFile(null); setSourceUrl(''); setResult(null); setError(''); setStatus(''); }}>Reset</button></div>}
    {imageTool && image && <p className="success-note"><Check size={17}/> Image dimensions read locally. No conversion was performed.</p>}
    {result && <DownloadResults items={downloadItems} title="Your image is ready"/>}
    {(id === 'exam-photo' || id === 'passport-photo') && <p className="field-hint"><Info size={15}/> Enter exact requirements from the authority you are applying to. No official presets are assumed.</p>}
  </section>;
}

function reduceRatio(width, height) {
  let a = width, b = height;
  while (b) [a, b] = [b, a % b];
  return `${width / a}:${height / a}`;
}

function trimWhitespace(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0);
  const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height);
  let left = width, top = height, right = -1, bottom = -1;
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    const index = (y * width + x) * 4;
    const visible = data[index + 3] > 8 && (data[index] < 246 || data[index + 1] < 246 || data[index + 2] < 246);
    if (visible) { left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y); }
  }
  if (right < left || bottom < top) return image;
  const crop = document.createElement('canvas');
  crop.width = right - left + 1; crop.height = bottom - top + 1;
  crop.getContext('2d').drawImage(image, left, top, crop.width, crop.height, 0, 0, crop.width, crop.height);
  crop.naturalWidth = crop.width; crop.naturalHeight = crop.height;
  return crop;
}
