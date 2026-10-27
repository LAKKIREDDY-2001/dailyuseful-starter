import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, FileText, Trash2, Upload } from 'lucide-react';
import { formatBytes, safeDownloadName, validateFiles } from '../utils/files.js';

export function UploadArea({ accept, multiple = false, label = 'Choose file', help, onFiles, onError, capture }) {
  const [drag, setDrag] = useState(false);
  function acceptFiles(list) {
    try { onFiles(validateFiles(Array.from(list), { accept, multiple })); }
    catch (error) { onError(error.message); }
  }
  return <label className={`upload-area ${drag ? 'dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(event) => { event.preventDefault(); setDrag(false); acceptFiles(event.dataTransfer.files); }}>
    <input className="visually-hidden" type="file" accept={accept.join(',')} multiple={multiple} capture={capture} onChange={(event) => { acceptFiles(event.target.files); event.target.value = ''; }} />
    <span className="upload-icon"><Upload/></span><b>{label}</b><span>or drag and drop {multiple ? 'files' : 'a file'} here</span><small>{help || `Up to 100 MB per file · ${accept.map((type) => type.replace('image/', '').replace('application/', '').toUpperCase()).join(', ')}`}</small>
  </label>;
}

export function FileList({ files, onMove, onRemove }) {
  if (!files.length) return null;
  return <ol className="selected-files">{files.map((file, index) => <li key={`${file.name}-${file.lastModified}-${index}`}>
    <span className="file-kind"><FileText size={18}/></span><span className="file-label"><b>{file.name}</b><small>{formatBytes(file.size)}</small></span>
    <div className="file-actions"><button type="button" className="icon-button" aria-label={`Move ${file.name} up`} disabled={!index} onClick={() => onMove(index, -1)}><ArrowUp size={16}/></button><button type="button" className="icon-button" aria-label={`Move ${file.name} down`} disabled={index === files.length - 1} onClick={() => onMove(index, 1)}><ArrowDown size={16}/></button><button type="button" className="icon-button danger" aria-label={`Remove ${file.name}`} onClick={() => onRemove(index)}><Trash2 size={16}/></button></div>
  </li>)}</ol>;
}

export function DownloadResults({ items, title = 'Ready to download' }) {
  const [urls, setUrls] = useState([]);
  const [names, setNames] = useState({});
  useEffect(() => {
    const created = items.map((item) => ({ ...item, url: URL.createObjectURL(item.blob) }));
    setUrls(created);
    setNames({});
    return () => created.forEach((item) => URL.revokeObjectURL(item.url));
  }, [items]);
  if (!items.length) return null;
  return <section className="download-results" aria-label={title}><div className="success-dot" aria-hidden="true">✓</div><div className="download-body"><b>{title}</b><p>The file was created locally. Rename the download if you like, then check it before sharing.</p><div className="download-links">{urls.map((item) => {
    const dot = item.name.lastIndexOf('.');
    const extension = dot > 0 ? item.name.slice(dot) : '';
    const baseName = dot > 0 ? item.name.slice(0, dot) : item.name;
    const enteredName = names[item.name] ?? baseName;
    const downloadName = safeDownloadName(enteredName, item.name);
    return <div className="download-item" key={item.name}>
      <label className="download-name"><span>File name</span><span className="download-input-row"><input aria-label={`Rename ${item.name}`} value={enteredName} onChange={(event) => setNames((current) => ({ ...current, [item.name]: event.target.value }))}/>{extension && <span className="download-ext">{extension}</span>}</span></label>
      <a className="button primary small" href={item.url} download={downloadName}>Download <span>{formatBytes(item.blob.size)}</span></a>
    </div>;
  })}</div></div></section>;
}

export function PdfThumbnails({ file }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setData(null); setError('');
    import('../utils/pdfRender.js').then(({ renderPdfThumbnails }) => renderPdfThumbnails(file, 12)).then((result) => { if (active) setData(result); }).catch((issue) => { if (active) setError(issue.message); });
    return () => { active = false; };
  }, [file]);
  if (error) return <p className="inline-error">Preview unavailable: {error}</p>;
  if (!data) return <p className="muted small-text">Loading page preview…</p>;
  return <div className="pdf-thumbs" aria-label={`Preview of ${data.totalPages} PDF pages`}>
    {data.thumbnails.map((src, index) => <figure key={`${index}-${src}`}><img src={src} alt={`Page ${index + 1} preview`}/><figcaption>Page {index + 1}</figcaption></figure>)}
    {data.totalPages > data.thumbnails.length && <p className="muted">Showing the first {data.thumbnails.length} of {data.totalPages} pages.</p>}
  </div>;
}
