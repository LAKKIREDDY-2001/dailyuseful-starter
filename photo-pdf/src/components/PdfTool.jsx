import { useEffect, useMemo, useState } from 'react';
import JSZip from 'jszip';
import { FileText, RotateCw } from 'lucide-react';
import { DownloadResults, FileList, PdfThumbnails, UploadArea } from './FileControls.jsx';
import { cleanFilename, formatBytes, parsePageOrder, parsePageRanges } from '../utils/files.js';
import { addPageNumbers, addText, extractPages, fillPdfForm, imagesToPdf, loadPdf, mergePdfs, pdfFormFields, rotatePdf, signPdf, transformPages, watermarkPdf } from '../utils/pdfTools.js';

const imageAccept = ['image/jpeg', 'image/png'];

export default function PdfTool({ tool }) {
  const id = tool.id;
  const multi = ['merge-pdf', 'jpg-to-pdf', 'scan-to-pdf'].includes(id);
  const wantsImages = ['jpg-to-pdf', 'scan-to-pdf'].includes(id);
  const accept = wantsImages ? imageAccept : ['application/pdf'];
  const [files, setFiles] = useState([]);
  const [signatureFile, setSignatureFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);
  const [fields, setFields] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [options, setOptions] = useState({
    ranges: '1', order: '', remove: '', rotation: '90', crop: 5, quality: 90, scale: 1.5,
    position: 'bottom-center', size: 12, margin: 36, numberStyle: 'number', color: '#182238',
    page: 1, text: '', pageSize: 'A4', landscape: false, watermarkSize: 34,
  });
  const file = files[0];
  const pdfOperation = !wantsImages;
  const showPages = pdfOperation && pageCount && ['organize-pdf', 'remove-pdf-pages', 'extract-pdf-pages', 'rotate-pdf', 'crop-pdf'].includes(id);
  const labels = {
    'pdf-to-markdown': 'Extract selectable text and save a Markdown file.',
    'ai-summarizer': 'Extract selectable text and create a short summary on this device.',
    'repair-pdf': 'Validate and resave PDFs this browser can read.',
  };

  useEffect(() => {
    setFiles([]); setSignatureFile(null); setResults([]); setStatus(''); setError(''); setPageCount(0); setFields([]); setFormValues({});
    setOptions((current) => ({ ...current, ranges: '1', order: '', remove: '', page: 1 }));
  }, [id]);

  useEffect(() => {
    let active = true;
    setPageCount(0); setFields([]); setFormValues({});
    if (file && !wantsImages) {
      loadPdf(file).then((doc) => {
        if (!active) return;
        const count = doc.getPageCount();
        setPageCount(count);
        setOptions((current) => ({ ...current, ranges: current.ranges === '1' ? (id === 'split-pdf' ? Array.from({ length: count }, (_, i) => i + 1).join(',') : `1-${count}`) : current.ranges, order: current.order || Array.from({ length: count }, (_, i) => i + 1).join(',') }));
        if (id === 'pdf-forms') pdfFormFields(file).then(({ fields: formFields }) => {
          if (active) setFields(formFields);
        }).catch((issue) => { if (active) setError(issue.message); });
      }).catch((issue) => { if (active) setError(issue.message); });
    } else if (wantsImages && files.length) {
      setPageCount(files.length);
    }
    return () => { active = false; };
  }, [file, id, wantsImages, files.length]);

  function set(key, value) { setOptions((current) => ({ ...current, [key]: value })); }
  function resetPageOptions() { setOptions((current) => ({ ...current, ranges: '1', order: '', remove: '', page: 1 })); }
  function changeFiles(selected) {
    setError(''); setResults([]); setStatus('');
    resetPageOptions();
    setFiles((previous) => multi ? [...previous, ...selected].slice(0, 30) : selected.slice(0, 1));
  }
  function moveFile(index, delta) {
    setFiles((previous) => { const next = [...previous]; const target = index + delta; [next[index], next[target]] = [next[target], next[index]]; return next; });
  }
  function removeFile(index) { setFiles((previous) => previous.filter((_, itemIndex) => itemIndex !== index)); setResults([]); resetPageOptions(); }
  function input(key, label, type = 'text', extra = {}) {
    if (type === 'select') return <label className="field" key={key}>{label}<select value={options[key]} onChange={(event) => set(key, event.target.value)}>{extra.options.map((value) => <option value={value} key={value}>{value.replaceAll('-', ' ').replace(/^./, (letter) => letter.toUpperCase())}</option>)}</select></label>;
    return <label className="field" key={key}>{label}<input type={type} value={options[key]} onChange={(event) => set(key, type === 'number' || type === 'range' ? Number(event.target.value) : event.target.value)} {...extra}/></label>;
  }

  const controls = useMemo(() => {
    if (['split-pdf', 'extract-pdf-pages'].includes(id)) return <>
      {input('ranges', 'Page ranges', 'text', { placeholder: 'Example: 1-3, 5' })}
      <p className="field-hint">Use page numbers separated by commas or ranges, such as 1-3, 5.</p>
    </>;
    if (id === 'organize-pdf') return <>
      {input('order', `New page order (${pageCount || 'all'} pages)`, 'text', { placeholder: '1, 3, 2' })}
      {input('remove', 'Pages to remove (optional)', 'text', { placeholder: 'Example: 4, 7-8' })}
      <label className="field">Rotate kept pages<select value={options.rotation} onChange={(event) => set('rotation', event.target.value)}><option value="0">No rotation</option><option value="90">90° clockwise</option><option value="180">180°</option><option value="270">270° clockwise</option></select></label>
      <p className="field-hint">List every page once in the order you want. Copied pages may not preserve every form or metadata feature.</p>
    </>;
    if (id === 'remove-pdf-pages') return <>{input('remove', 'Pages to remove', 'text', { placeholder: 'Example: 2, 5-7' })}<p className="field-hint">At least one page must remain.</p></>;
    if (id === 'rotate-pdf') return <label className="field">Rotation<select value={options.rotation} onChange={(event) => set('rotation', event.target.value)}><option value="90">90° clockwise</option><option value="180">180°</option><option value="270">270° clockwise</option></select></label>;
    if (id === 'page-numbers') return <>
      <div className="field-row">{input('position', 'Position', 'select', { options: ['bottom-left','bottom-center','bottom-right','top-left','top-center','top-right'] })}{input('numberStyle', 'Style', 'select', { options: ['number','page-of-total'] })}</div>
      <div className="field-row">{input('size', 'Font size (pt)', 'number', { min: 6, max: 48 })}{input('margin', 'Margin (pt)', 'number', { min: 0, max: 200 })}</div>
      {input('color', 'Text color', 'color')}
    </>;
    if (['jpg-to-pdf', 'scan-to-pdf'].includes(id)) return <>
      <div className="field-row"><label className="field">Page size<select value={options.pageSize} onChange={(event) => set('pageSize', event.target.value)}><option>A4</option><option>Letter</option></select></label><label className="field">Orientation<select value={options.landscape ? 'landscape' : 'portrait'} onChange={(event) => set('landscape', event.target.value === 'landscape')}><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label></div>
      {input('margin', 'Margin (pt)', 'number', { min: 0, max: 120 })}
      <p className="field-hint">Each photo is fitted within one page. Camera capture depends on browser and device support.</p>
    </>;
    if (id === 'crop-pdf') return <><label className="field">Inset each edge: {options.crop}%<input type="range" min="0" max="25" value={options.crop} onChange={(event) => set('crop', Number(event.target.value))}/></label><p className="field-hint">This changes the visible crop box. Hidden content remains in the document.</p></>;
    if (id === 'pdf-to-jpg') return <>
      <label className="field">Image quality: {options.quality}%<input type="range" min="40" max="100" value={options.quality} onChange={(event) => set('quality', Number(event.target.value))}/></label>
      <label className="field">Render scale<select value={options.scale} onChange={(event) => set('scale', Number(event.target.value))}><option value="1">Standard</option><option value="1.5">High</option><option value="2">Very high (uses more memory)</option></select></label>
    </>;
    if (id === 'edit-pdf') return <>
      {input('text', 'Text to add', 'text', { maxLength: 160, placeholder: 'Add a note' })}
      <div className="field-row">{input('page', `Page number (1–${pageCount || '?'})`, 'number', { min: 1, max: pageCount })}{input('size', 'Font size (pt)', 'number', { min: 6, max: 48 })}</div>
      <div className="field-row">{input('color', 'Text color', 'color')}{input('margin', 'Margin from left and bottom (pt)', 'number', { min: 0, max: 500 })}</div>
    </>;
    if (id === 'watermark-pdf') return <>
      {input('text', 'Watermark text', 'text', { maxLength: 80, placeholder: 'DRAFT' })}
      <div className="field-row">{input('watermarkSize', 'Font size (pt)', 'number', { min: 10, max: 100 })}{input('color', 'Watermark color', 'color')}</div>
    </>;
    if (id === 'sign-pdf') return <>
      <UploadArea accept={imageAccept} label="Choose signature image" help="PNG or JPG · placed as an image on the selected page" onFiles={(selected) => setSignatureFile(selected[0])} onError={setError}/>
      {signatureFile && <p className="file-pill">Signature image: {signatureFile.name}</p>}
      {input('page', `Page number (1–${pageCount || '?'})`, 'number', { min: 1, max: pageCount })}
    </>;
    if (id === 'pdf-forms') return fields.length ? <div className="form-fields"><p>Found {fields.length} supported form field{fields.length === 1 ? '' : 's'}.</p>{fields.map((field) => <label className="field" key={field.name}>{field.name}<input type={field.type.includes('CheckBox') ? 'checkbox' : 'text'} checked={field.type.includes('CheckBox') ? Boolean(formValues[field.name]) : undefined} value={field.type.includes('CheckBox') ? undefined : (formValues[field.name] || '')} onChange={(event) => setFormValues((current) => ({ ...current, [field.name]: field.type.includes('CheckBox') ? event.target.checked : event.target.value }))}/><small>{field.type}</small></label>)}</div> : <p className="muted">Upload a PDF to inspect standard interactive form fields.</p>;
    return <p className="muted">{labels[id] || 'Choose a file and start the local operation.'}</p>;
  }, [id, options, pageCount, fields, formValues, signatureFile]);

  async function process() {
    if (!files.length) { setError(wantsImages ? 'Choose at least one image.' : 'Choose a PDF first.'); return; }
    setBusy(true); setError(''); setResults([]); setStatus('Working locally…');
    try {
      const name = file?.name || 'document.pdf';
      let output;
      let completionStatus = '';
      let outputName = cleanFilename(name, `-${id}`, 'pdf');
      if (id === 'merge-pdf') {
        if (files.length < 2) throw new Error('Choose at least two PDFs to merge.');
        output = await mergePdfs(files);
      } else if (id === 'split-pdf') {
        const groups = parsePageRanges(options.ranges, pageCount);
        const zip = new JSZip();
        for (let index = 0; index < groups.length; index += 1) {
          const bytes = await extractPages(file, groups[index]);
          zip.file(`part-${index + 1}.pdf`, bytes);
        }
        output = await zip.generateAsync({ type: 'blob' }); outputName = cleanFilename(name, '-split', 'zip');
      } else if (id === 'extract-pdf-pages') {
        const selected = parsePageRanges(options.ranges, pageCount).flat();
        output = await extractPages(file, selected);
      } else if (id === 'organize-pdf') {
        const order = parsePageOrder(options.order, pageCount);
        const remove = options.remove.trim() ? parsePageRanges(options.remove, pageCount).flat() : [];
        output = await transformPages(file, { order, remove, rotate: Number(options.rotation) });
      } else if (id === 'remove-pdf-pages') {
        const remove = parsePageRanges(options.remove, pageCount).flat();
        if (remove.length >= pageCount) throw new Error('At least one page must remain.');
        output = await transformPages(file, { remove });
      } else if (id === 'rotate-pdf') output = await rotatePdf(file, Number(options.rotation));
      else if (id === 'page-numbers') output = await addPageNumbers(file, { position: options.position, size: Number(options.size), margin: Number(options.margin), color: options.color, style: options.numberStyle });
      else if (id === 'jpg-to-pdf' || id === 'scan-to-pdf') { output = await imagesToPdf(files, { pageSize: options.pageSize, landscape: options.landscape, margin: Number(options.margin) }); outputName = cleanFilename(name, '-photos', 'pdf'); }
      else if (id === 'crop-pdf') output = await transformPages(file, { cropPercent: Number(options.crop) });
      else if (id === 'compress-pdf' || id === 'repair-pdf') {
        const doc = await loadPdf(file); output = await doc.save({ useObjectStreams: true });
        const delta = Math.round((1 - output.byteLength / file.size) * 100);
        completionStatus = `Input ${formatBytes(file.size)} · output ${formatBytes(output.byteLength)} · ${delta > 0 ? `${delta}% smaller` : delta < 0 ? `${Math.abs(delta)}% larger` : 'same size'}.`;
      } else if (id === 'pdf-to-jpg') {
        const { pdfToJpgFiles } = await import('../utils/pdfRender.js');
        const items = await pdfToJpgFiles(file, { quality: Number(options.quality) / 100, scale: Number(options.scale), onProgress: (done, total) => setStatus(`Rendering page ${done} of ${total}…`) });
        setResults(items); setStatus('Pages rendered. Download individual images or the ZIP.'); setBusy(false); return;
      } else if (id === 'pdf-to-markdown' || id === 'ai-summarizer') {
        const { pdfTextByPage } = await import('../utils/pdfRender.js');
        const pages = await pdfTextByPage(file);
        let text = pages.map((pageText, index) => `## Page ${index + 1}\n\n${pageText}`).join('\n\n');
        if (id === 'ai-summarizer') text = extractiveSummary(pages);
        output = new Blob([text], { type: 'text/markdown;charset=utf-8' }); outputName = cleanFilename(name, id === 'ai-summarizer' ? '-summary' : '', 'md');
      } else if (id === 'edit-pdf') output = await addText(file, options.text, Number(options.page), { size: Number(options.size), color: options.color, x: Number(options.margin), y: Number(options.margin) });
      else if (id === 'watermark-pdf') output = await watermarkPdf(file, options.text, { size: Number(options.watermarkSize), color: options.color });
      else if (id === 'sign-pdf') {
        if (!signatureFile) throw new Error('Choose a PNG or JPG signature image first.');
        output = await signPdf(file, signatureFile, Number(options.page));
      } else if (id === 'pdf-forms') output = await fillPdfForm(file, formValues);
      else throw new Error('This operation is not available in this version.');

      const type = output instanceof Blob ? output.type : outputName.endsWith('.zip') ? 'application/zip' : 'application/pdf';
      const blob = output instanceof Blob ? output : new Blob([output], { type: type || 'application/pdf' });
      setResults([{ name: outputName, blob }]);
      setStatus(completionStatus || `Finished locally · ${formatBytes(blob.size)} output.`);
    } catch (issue) {
      setError(issue.message || 'This file could not be processed. Try a different or smaller file.'); setStatus('');
    } finally { setBusy(false); }
  }

  return <section className="workspace panel">
    <div className="workspace-intro"><div><span className="eyebrow">LOCAL WORKSPACE</span><h2>{wantsImages ? 'Add your images' : 'Add your PDF'}</h2><p>{wantsImages ? 'Images are placed on pages in the order shown.' : 'Select a document to preview the pages and set your options.'} Files are processed in this browser.</p></div><span className="local-badge"><ShieldCheckIcon/> Local</span></div>
    <UploadArea accept={accept} multiple={multi} capture={id === 'scan-to-pdf' ? 'environment' : undefined} label={multi ? 'Choose files' : 'Choose a file'} help={wantsImages ? 'JPG or PNG · up to 100 MB per image' : 'PDF · up to 100 MB'} onFiles={changeFiles} onError={setError}/>
    <FileList files={files} onMove={moveFile} onRemove={removeFile}/>
    {showPages && file && <PdfThumbnails file={file}/>}
    {file && !wantsImages && <p className="file-meta"><FileText size={16}/> {pageCount ? `${pageCount} page${pageCount === 1 ? '' : 's'} detected` : 'Reading PDF…'} · {formatBytes(file.size)}</p>}
    {controls && <div className="tool-controls">{controls}</div>}
    {error && <p className="error-message" role="alert">{error}</p>}
    {status && <p className="status-message" role="status" aria-live="polite">{status}</p>}
    <div className="workspace-actions"><button type="button" className="button primary" disabled={busy || !files.length} onClick={process}>{busy ? 'Processing…' : 'Process locally'} <RotateCw size={16}/></button><button type="button" className="button secondary" disabled={busy} onClick={() => { setFiles([]); setSignatureFile(null); setResults([]); setError(''); setStatus(''); setPageCount(0); resetPageOptions(); }}>Reset</button></div>
    <DownloadResults items={results} title={id === 'pdf-to-jpg' ? 'Images are ready' : 'Your file is ready'}/>
  </section>;
}

function extractiveSummary(pages) {
  const sentences = pages.join(' ').replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  if (!sentences.length) return '# Local summary\n\nNo selectable text was found. Scanned PDFs need OCR, which is not included.';
  const keywords = new Map();
  for (const word of pages.join(' ').toLowerCase().match(/[a-z]{4,}/g) || []) keywords.set(word, (keywords.get(word) || 0) + 1);
  const scored = sentences.map((sentence, index) => ({ sentence: sentence.trim(), index, score: (sentence.toLowerCase().match(/[a-z]{4,}/g) || []).reduce((sum, word) => sum + (keywords.get(word) || 0), 0) / Math.max(1, sentence.split(/\s+/).length) }));
  return '# Local extractive summary\n\n' + scored.sort((a, b) => b.score - a.score).slice(0, 5).sort((a, b) => a.index - b.index).map((item) => `- ${item.sentence}`).join('\n');
}

function ShieldCheckIcon() { return <span aria-hidden="true">✓</span>; }
