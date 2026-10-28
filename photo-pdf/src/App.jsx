import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown, CircleHelp, Image, LockKeyhole, ScanLine, Search, ShieldCheck, Upload, WandSparkles, X } from 'lucide-react';
import { categories, supportedTools, toolNotes, toolGuides, tools, toolsById } from './data/tools.js';
import { iconFor } from './components/Icons.jsx';
import { Footer, Header, ToolCard } from './components/SiteParts.jsx';
import PrintTool from './components/PrintTool.jsx';

const PdfTool = lazy(() => import('./components/PdfTool.jsx'));
const ImageTool = lazy(() => import('./components/ImageTool.jsx'));

function PageMeta({ title, description }) {
  useEffect(() => {
    const pageTitle = title ? `${title} — FileFix` : 'FileFix — Free PDF & Image Tools';
    const pageDescription = description || 'Free browser-based PDF and image tools for everyday file tasks.';
    document.title = pageTitle;
    const setMeta = (selector, attribute, value) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        const [key, name] = selector.match(/\[(name|property)="([^"]+)"\]/).slice(1);
        element.setAttribute(key, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', value);
    };
    setMeta('meta[name="description"]', 'name', pageDescription);
    setMeta('meta[property="og:title"]', 'property', pageTitle);
    setMeta('meta[property="og:description"]', 'property', pageDescription);
    setMeta('meta[name="twitter:title"]', 'name', pageTitle);
    setMeta('meta[name="twitter:description"]', 'name', pageDescription);
    const pageUrl = window.location.origin + window.location.pathname;
    setMeta('meta[property="og:url"]', 'property', pageUrl);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', pageUrl);
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
      {supported && toolGuides[tool.id] && <ToolGuide guide={toolGuides[tool.id]} />}
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


function ToolGuide({ guide }) {
  return <section className="tool-guide" aria-labelledby="tool-guide-title">
    <span className="eyebrow">HOW TO USE THIS TOOL</span>
    <h2 id="tool-guide-title">{guide.heading}</h2>
    <p className="tool-guide-intro">{guide.intro}</p>
    <ol className="tool-guide-steps">{guide.steps.map((step) => <li key={step.title}><strong>{step.title}</strong><p>{step.text}</p></li>)}</ol>
    <div className="tool-guide-tip"><strong>Helpful tip</strong><p>{guide.tip}</p></div>
    <section className="tool-guide-faq" aria-label={`Frequently asked questions about ${guide.heading}`}>
      <h3>Frequently asked questions</h3>
      {guide.faqs.map((item) => <details key={item.q}><summary>{item.q}<ChevronDown size={16}/></summary><p>{item.a}</p></details>)}
    </section>
  </section>;
}

function RelatedTools({ current }) {
  const related = tools.filter((tool) => tool.id !== current.id && tool.category === current.category && supportedTools.has(tool.id)).slice(0, 4);
  if (!related.length) return null;
  return <section className="related-section"><h2>Related tools</h2><div className="related-links">{related.map((tool) => <Link key={tool.id} to={tool.path}>{tool.name} <ArrowRight size={14}/></Link>)}</div></section>;
}

function InfoPage({ type }) {
  const pages = {
    about: {
      title: 'About FileFix',
      eyebrow: 'A SMALL, HONEST TOOLBOX',
      description: 'FileFix is an independent browser-based toolbox for everyday PDF and image tasks. Tools marked available run using browser capabilities and included libraries. Tools that are not implemented are marked as coming soon rather than presented as working.',
      paragraphs: [
        'FileFix is not affiliated with any government agency, examination authority, passport authority, PDF vendor, or document provider.',
        'Availability and results can vary by file, browser, device memory, and file complexity. Please review each exported file before relying on it.'
      ]
    },
    privacy: {
      title: 'Privacy Policy',
      eyebrow: 'YOUR FILES AND YOUR PRIVACY',
      description: 'Last updated: 28 October 2026. This policy describes the current free version of FileFix.',
      paragraphs: [
        'File processing: For tools marked available, file operations are designed to run in your browser. FileFix does not operate a server-side file upload queue. Do not use a tool if your browser indicates that a file is being sent somewhere unexpected.',
        'Technical information: Like most websites, the hosting and delivery infrastructure may process technical request information (for example, IP address, browser details, and request time) to deliver and protect the site. Such processing is governed by the hosting provider’s own policies.',
        'Browser storage: FileFix uses your browser’s local storage only to remember your light/dark theme preference. It is not used by this app to store your uploaded documents.',
        'Advertising and analytics: No third-party advertising or analytics script is currently enabled in this release. If advertising, analytics, or other third-party services are added later, this policy will be updated before those services are enabled. Those providers may process information under their own policies.',
        'Your choices: You can close the page to end the current session and clear this site’s browser storage through your browser settings. Avoid uploading files containing highly sensitive information to any online tool unless you have assessed whether it is appropriate for your needs.'
      ]
    },
    contact: {
      title: 'Contact FileFix',
      eyebrow: 'FEEDBACK AND SUPPORT',
      description: 'Have a question, suggestion, or issue with a FileFix tool? Contact us by email.',
      paragraphs: [
        'Support email: lakkistudy@gmail.com',
        'When reporting a problem, include the tool name, your browser, and a brief description of what happened. Please do not email passwords, banking details, identity numbers, or sensitive documents unless absolutely necessary.',
        'You can also report bugs or suggest improvements through the project feedback page. Public issues should never include private information.'
      ],
      email: 'lakkistudy@gmail.com',
      link: { href: 'https://github.com/LAKKIREDDY-2001/dailyuseful-starter/issues', label: 'Visit the project feedback page' }
    },
    terms: {
      title: 'Terms of Use',
      eyebrow: 'PLEASE READ BEFORE USING FILEFIX',
      description: 'Last updated: 28 October 2026.',
      paragraphs: [
        'By using FileFix, you agree to use the site lawfully and in accordance with these terms. If you do not agree, please stop using the site.',
        'What the service provides: FileFix offers browser-based PDF and image utilities. Some catalog entries are not implemented and are labelled as coming soon or unavailable. We may add, change, suspend, or remove tools without notice.',
        'Your files and rights: You remain responsible for your files and must have the rights and permissions needed to process them. You are responsible for keeping original copies and for protecting sensitive information.',
        'Check your results: Tools are provided for convenience and may produce incomplete, altered, or unsuitable output. Always open and verify the exported file before submitting, printing, sharing, or relying on it. Check the current official requirements for passport, examination, legal, financial, and other important documents.',
        'No professional advice: FileFix does not provide legal, government, identity-verification, or professional document-compliance services. An image of a signature is not a certificate-backed digital signature. Cropping a PDF does not securely erase hidden content.',
        'Availability and warranty: The site is provided on an “as available” basis to the extent permitted by applicable law. We do not guarantee uninterrupted access, error-free operation, compatibility with every file, or that a result will meet a particular requirement.',
        'Liability: To the maximum extent permitted by applicable law, FileFix and its project maintainers are not liable for indirect or consequential loss arising from use of the site. Nothing in these terms excludes rights or liability that cannot lawfully be excluded.',
        'Changes: These terms may be updated as the site changes. The “Last updated” date above indicates the latest revision.'
      ]
    }
  };
  const page = pages[type] || pages.about;
  return <main className="container info-page">
    <PageMeta title={page.title} description={page.description}/>
    <span className="eyebrow">{page.eyebrow}</span>
    <h1>{page.title}</h1>
    <p className="lead">{page.description}</p>
    {page.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
    {page.email && <p><a className="button primary" href={`mailto:${page.email}`}>Email FileFix: {page.email} <ArrowRight size={16}/></a></p>}
    {page.link && <p><a className="button secondary" href={page.link.href} target="_blank" rel="noreferrer">{page.link.label} <ArrowRight size={16}/></a></p>}
    <Link className="button secondary" to="/">Back to all tools <ArrowRight size={16}/></Link>
  </main>;
}

function NotFound() { return <main className="container info-page"><span className="eyebrow">404 · NOT FOUND</span><h1>That page is not here.</h1><p className="lead">The link may be old. Browse the available tools or return home.</p><Link className="button primary" to="/">Browse tools <ArrowRight size={16}/></Link></main>; }

function ToolWorkspaceRouter() { return <Routes><Route path="/" element={<Home/>}/><Route path="/tools/:toolId" element={<ToolPage/>}/><Route path="/about" element={<InfoPage type="about"/>}/><Route path="/privacy" element={<InfoPage type="privacy"/>}/><Route path="/terms" element={<InfoPage type="terms"/>}/><Route path="/contact" element={<InfoPage type="contact"/>}/><Route path="*" element={<NotFound/>}/></Routes>; }

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

function AdSlot() { return null; }
