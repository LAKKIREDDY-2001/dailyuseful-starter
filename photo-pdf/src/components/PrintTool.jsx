import { useEffect, useRef, useState } from 'react';
import { Printer, ShieldCheck } from 'lucide-react';
import { loadImage } from '../utils/imageTools.js';
import { formatBytes } from '../utils/files.js';

export default function PrintTool() {
  const [title, setTitle] = useState('My document');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const imageGeneration = useRef(0);
  useEffect(() => {
    if (!imageFile) { setImageUrl(''); return undefined; }
    const url = URL.createObjectURL(imageFile);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);
  async function chooseImage(event) {
    const selected = event.target.files?.[0];
    const generation = ++imageGeneration.current;
    if (!selected) { setImageFile(null); setError(''); return; }
    if (selected.size > 100 * 1024 * 1024) { setImageFile(null); setError('Choose an image under 100 MB.'); return; }
    try {
      await loadImage(selected);
      if (generation === imageGeneration.current) { setImageFile(selected); setError(''); }
    } catch (issue) {
      if (generation === imageGeneration.current) { setImageFile(null); setError(issue.message); }
    }
  }
  function printDocument() {
    if (!content.trim() && !imageFile) { setError('Add text or choose an image before printing.'); return; }
    setError(''); window.print();
  }
  return <section className="workspace panel">
    <div className="workspace-intro no-print"><div><span className="eyebrow">BROWSER PRINT</span><h2>Prepare a page or photo</h2><p>Enter text or choose an image, then use your browser’s print dialog to save it as a PDF.</p></div><span className="local-badge"><ShieldCheck aria-hidden="true"/> Local</span></div>
    <div className="print-editor no-print">
      <label className="field">Document title<input maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Document title" /></label>
      <label className="field">Document text<textarea rows={10} value={content} onChange={(event) => setContent(event.target.value)} placeholder="Type or paste the text you want to save as a PDF." /></label>
      <label className="field" htmlFor="print-image">Optional image<input id="print-image" type="file" accept="image/*" onChange={chooseImage}/><small>JPG, PNG, WebP, or another image your browser can display · up to 100 MB</small></label>
      {imageFile && <p className="field-hint">Selected image: {imageFile.name} · {formatBytes(imageFile.size)}</p>}
      {error && <p className="error-message" role="alert">{error}</p>}
      <button type="button" className="button primary" onClick={printDocument}><Printer size={17}/> Print / Save as PDF</button>
      <p className="field-hint">In the print window, choose “Save as PDF” or your browser’s equivalent. Printing happens on your device.</p>
    </div>
    <article className="print-document" aria-label="Print preview">
      <h1>{title.trim() || 'Untitled document'}</h1>
      {content.trim() ? <p>{content}</p> : !imageFile && <p className="print-placeholder no-print">Your print preview will appear here.</p>}
      {imageUrl && <img src={imageUrl} alt={`Selected image: ${imageFile.name}`} />}
    </article>
  </section>;
}
