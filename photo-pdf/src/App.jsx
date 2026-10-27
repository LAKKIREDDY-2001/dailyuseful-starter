import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown, CircleHelp, Image, LockKeyhole, ScanLine, Search, ShieldCheck, Upload, WandSparkles } from 'lucide-react';
import { categories, supportedTools, toolNotes, tools, toolsById } from './data/tools.js';
import { iconFor } from './components/Icons.jsx';
import { Footer, Header, ToolCard } from './components/SiteParts.jsx';
import PrintTool from './components/PrintTool.jsx';

const PdfTool = lazy(() => import('./components/PdfTool.jsx'));
const ImageTool = lazy(() => import('./components/ImageTool.jsx'));

function PageMeta({ title, description }) {
  useEffect(() => {
    document.title = title ? `${title} — FileFix` : 'FileFix — Free PDF & Image Tools';
    const meta = document.querySelector('meta[name="description"]');
    if (meta && description) meta.setAttribute('content', description);
  }, [title, description]);
  return null;
}

function Home() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const category = params.get('category') || 'All Tools';
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const categoryMatch = category === 'All Tools'
        || category === 'PDF Tools' && (tool.category.includes('PDF') || tool.category === 'Workflows')
        || category === 'Image Tools' && (tool.category.startsWith('Image') || tool.category === 'Exam Photo & Signature')
        || tool.category === category;
      const searchMatch = !normalized || `${tool.name} ${tool.category} ${tool.description}`.toLowerCase().includes(normalized);
      return categoryMatch && searchMatch;
    });
  }, [category, query]);

  function selectCategory(value) {
    const next = new URLSearchParams(params);
    if (value === 'All Tools') next.delete('category');
    else next.set('category', value);
    setParams(next, { replace: true });
    document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return <>
    <PageMeta description="Merge, split, edit, convert, resize, and compress files with free browser-based PDF and image tools." />
    <section className="hero container">
      <div className="hero-copy">
        <span className="eyebrow"><ShieldCheck size={15} /> PRIVATE BY DESIGN</span>
        <h1>Every tool you need for <span>PDFs and images</span>, in one place.</h1>
        <p>Merge, convert, resize, compress, crop, and organize files with simple browser-based tools.</p>
        <form className="hero-search" role="search" onSubmit={(event) => { event.preventDefault(); document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' }); }}>
          <Search size={19} aria-hidden="true" />
          <label className="sr-only" htmlFor="hero-search">Search all tools</label>
          <input id="hero-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="What would you like to do?" />
          <button type="submit" className="button primary">Search</button>
        </form>
        <div className="hero-actions"><a className="button primary" href="#tools">Explore all tools <ArrowRight size={17} /></a><Link className="button secondary" to="/tools/resize-image">Upload an image <Upload size={16} /></Link></div>
        <p className="privacy-line"><ShieldCheck size={15} /> Files stay on your device for the tools supported here. Advanced conversions are clearly marked.</p>
      </div>
      <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="file-stack"><div className="file-sheet sheet-back"><span>PDF</span><i></i><i></i></div><div className="file-sheet sheet-front"><span>IMG</span><div className="image-mark"><Image size={34}/></div><i></i><i></i></div><div className="floating-check"><Check size={18}/></div></div></div>
    </section>
    <section className="trust-strip"><div className="container trust-inner"><span><ShieldCheck /> Local processing for supported tools</span><span><LockKeyhole /> No account or upload queue</span><span><WandSparkles /> Simple controls, clear limits</span></div></section>
    <section id="tools" className="catalog-section container">
      <div className="section-heading"><div><span className="eyebrow">TOOLBOX</span><h2>Find the right tool</h2><p>Choose a tool to open its dedicated workspace.</p></div><div className="catalog-search"><Search size={18}/><label className="sr-only" htmlFor="catalog-search">Search tools</label><input id="catalog-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tools" /></div></div>
      <nav className="category-nav" aria-label="Filter tools by category">
        {categories.map((item) => <button type="button" key={item} className={`category-chip ${category === item ? 'selected' : ''}`} aria-pressed={category === item} onClick={() => selectCategory(item)}>{item}</button>)}
      </nav>
      {(category === 'All Tools' || category === 'Workflows') && !query && <div className="workflow-banner"><div className="workflow-icon"><ScanLine /></div><div><b>Document to PDF workflow</b><p>Capture or import a stack of pages, reorder them, then save one PDF.</p></div><Link to="/tools/scan-to-pdf">Open Scan to PDF <ArrowRight size={16}/></Link></div>}
      <div className="catalog-meta"><span>{filtered.length} {filtered.length === 1 ? 'tool' : 'tools'}</span>{query && <button type="button" className="clear-search" onClick={() => setQuery('')}>Clear search <X size={14}/></button>}</div>
      {filtered.length ? <div className="tool-grid">{filtered.map((tool) => <ToolCard key={tool.id} tool={tool} supported={supportedTools.has(tool.id)} />)}</div> : <div className="empty-state"><Search size={26}/><b>No matching tools</b><span>Try another name or choose a different category.</span></div>}
    </section>
    <section className="privacy-banner container"><div className="privacy-icon"><LockKeyhole/></div><div><span className="eyebrow">YOUR FILES, YOUR DEVICE</span><h2>Private processing for the tools that work offline</h2><p>PDF and image files are handled in your browser. This website does not send files to a server. Some advanced conversions need specialized engines and are marked unavailable.</p></div><Link to="/privacy">Read privacy details <ArrowRight size={16}/></Link></section>
    <section className="faq-section container"><div className="section-heading"><div><span className="eyebrow">GOOD TO KNOW</span><h2>Questions, answered</h2></div></div><div className="faq-grid"><details><summary>Do my files get uploaded?<ChevronDown size={17}/></summary><p>Supported tools use browser libraries and canvas locally. The site does not upload selected files. Some PDF features are limited by the file and browser.</p></details><details><summary>Are all 45 tools available today?<ChevronDown size={17}/></summary><p>The catalog covers the requested tools. Reliable browser-side tools work now; advanced office conversion, password encryption, OCR, translation, and secure redaction are labeled unavailable instead of using fake buttons.</p></details><details><summary>Will image compression always reduce size?<ChevronDown size={17}/></summary><p>No. The result shows its measured size and reports when the output is larger. JPEG quality and format can change detail and transparency.</p></details></div></section>
    <AdSlot home />
  </>;
}

function ToolPage() {
  const { toolId } = useParams();
  const tool = toolsById[toolId];
  if (!tool) return <NotFound />;
  const supported = supportedTools.has(tool.id);
  return <>
    <PageMeta title={tool.name} description={tool.description} />
    <main className="container tool-page">
      <div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><span>{tool.category}</span><span>/</span><span>{tool.name}</span></div>
      <div className="tool-heading"><div className="tool-heading-icon">{iconFor(tool.icon)}</div><div><span className="eyebrow">{tool.category.toUpperCase()}</span><h1>{tool.name}</h1><p>{tool.description}</p></div></div>
      {supported ? <ToolWorkspace tool={tool} /> : <div className="unavailable panel"><span className="coming-badge">ADVANCED · NOT AVAILABLE</span><h2>This tool is not available in this version</h2><p>{tool.description} FileFix does not upload files to an external service. A future version would need a reliable local engine or your explicit consent before using a remote service.</p><div className="related-links"><Link to="/tools/pdf-to-markdown">Try PDF text extraction</Link><Link to="/tools/pdf-to-jpg">Try PDF to JPG</Link><Link to="/">Browse available tools</Link></div></div>}
      {supported && toolNotes[tool.id] && <div className="tool-note"><CircleHelp size={18}/><p>{toolNotes[tool.id]}</p></div>}
      <RelatedTools current={tool} />
      <AdSlot />
    </main>
  </>;
}

function ToolWorkspace({ tool }) {
  if (tool.id === 'html-to-pdf') return <PrintTool />;
  return <Suspense fallback={<div className="panel processing">Loading this tool…</div>}>
    {tool.category.startsWith('Image') || tool.category === 'Exam Photo & Signature'
      ? <ImageTool key={tool.id} tool={tool} />
      : <PdfTool key={tool.id} tool={tool} />}
  </Suspense>;
}

function RelatedTools({ current }) {
  const related = tools.filter((tool) => tool.id !== current.id && tool.category === current.category && supportedTools.has(tool.id)).slice(0, 4);
  if (!related.length) return null;
  return <section className="related-section"><h2>Related tools</h2><div className="related-links">{related.map((tool) => <Link key={tool.id} to={tool.path}>{tool.name} <ArrowRight size={14}/></Link>)}</div></section>;
}

function InfoPage({ type }) {
  const content = {
    about: { title: 'About FileFix', eyebrow: 'A SMALL, HONEST TOOLBOX', body: 'FileFix brings practical PDF and image utilities together in one browser-based website. Supported operations run on your device using open-source libraries. Features that need a specialized engine are labeled unavailable instead of being presented as working.', extra: 'FileFix is an independent project and is not affiliated with an exam authority, document provider, or PDF vendor.' },
    privacy: { title: 'Privacy', eyebrow: 'FILES STAY LOCAL', body: 'FileFix does not upload documents or images. Processing happens in your browser with the selected file and temporary browser memory. The site does not include analytics, third-party advertising scripts, accounts, or a server-side file queue.', extra: 'Object URLs and rendering canvases are released after use. Clearing this page or closing the tab also releases browser memory. Browser storage is not used for your files.' },
    contact: { title: 'Contact', eyebrow: 'NO MESSAGE SERVICE CONFIGURED', body: 'This free static release has no contact form or support mailbox configured, and it does not collect messages. If you host this project, add your own public contact address before launch.', extra: 'Do not put private documents, passwords, PANs, or banking information into a public issue or message.' },
  }[type];
  return <main className="container info-page"><PageMeta title={content.title} description={content.body}/><span className="eyebrow">{content.eyebrow}</span><h1>{content.title}</h1><p className="lead">{content.body}</p><p>{content.extra}</p><Link className="button secondary" to="/">Back to all tools <ArrowRight size={16}/></Link></main>;
}

function NotFound() { return <main className="container info-page"><span className="eyebrow">404 · NOT FOUND</span><h1>That page is not here.</h1><p className="lead">The link may be old. Browse the available tools or return home.</p><Link className="button primary" to="/">Browse tools <ArrowRight size={16}/></Link></main>; }

function ToolWorkspaceRouter() { return <Routes><Route path="/" element={<Home/>}/><Route path="/tools/:toolId" element={<ToolPage/>}/><Route path="/about" element={<InfoPage type="about"/>}/><Route path="/privacy" element={<InfoPage type="privacy"/>}/><Route path="/contact" element={<InfoPage type="contact"/>}/><Route path="*" element={<NotFound/>}/></Routes>; }

export default function App() {
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('filefix-theme') || 'light'; } catch { return 'light'; } });
  const [mobileNav, setMobileNav] = useState(false);
  const location = useLocation();
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('filefix-theme', theme); } catch { /* Theme preference is optional. */ }
  }, [theme]);
  useEffect(() => setMobileNav(false), [location.pathname]);
  return <div className="app-shell"><Header theme={theme} onTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} mobileNav={mobileNav} onMenu={() => setMobileNav(!mobileNav)}/><ToolWorkspaceRouter/><Footer/></div>;
}

function AdSlot({ home = false }) { return <aside className={`ad-slot ${home ? 'container' : ''}`} aria-label="Reserved advertising area">Ad placement reserved · no ad script is active</aside>; }
