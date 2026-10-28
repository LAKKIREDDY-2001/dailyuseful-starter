import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Menu, Moon, Sun, X } from 'lucide-react';
import { iconFor } from './Icons.jsx';

export function Header({ theme, onTheme, mobileNav, onMenu }) {
  return <header className="site-header">
    <div className="container header-inner">
      <Link className="brand" to="/" aria-label="FileFix home"><span className="brand-mark"><FileText size={20}/></span><span>File<span>Fix</span></span></Link>
      <button className="mobile-menu button-plain" type="button" aria-expanded={mobileNav} aria-controls="main-navigation" aria-label={mobileNav ? 'Close navigation' : 'Open navigation'} onClick={onMenu}>{mobileNav ? <X/> : <Menu/>}</button>
      <nav id="main-navigation" className={`main-nav ${mobileNav ? 'open' : ''}`} aria-label="Main navigation">
        <Link to="/">Home</Link><Link to="/#tools">All Tools</Link><Link to="/?category=PDF%20Tools#tools">PDF Tools</Link><Link to="/?category=Image%20Tools#tools">Image Tools</Link><Link to="/tools/exam-photo">Exam Photo</Link><Link to="/about">About</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link>
        <button className="theme-toggle" type="button" onClick={onTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>{theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}</button>
      </nav>
    </div>
  </header>;
}

export function ToolCard({ tool, supported }) {
  return <Link className={`tool-card ${supported ? '' : 'not-ready'}`} to={tool.path}>
    <span className="card-icon">{iconFor(tool.icon)}</span>
    {!supported && <span className="coming-badge">Coming soon</span>}
    <h3>{tool.name}</h3><p>{tool.description}</p>
    <span className="card-arrow" aria-hidden="true"><ArrowRight size={17}/></span>
  </Link>;
}

export function Footer() {
  return <footer className="site-footer"><div className="container footer-grid">
    <div><Link className="brand footer-brand" to="/"><span className="brand-mark"><FileText size={18}/></span><span>File<span>Fix</span></span></Link><p>Every tool you need for PDFs and images, in one place.</p><small>Supported file operations run in your browser.</small></div>
    <div><h2>Explore</h2><Link to="/?category=PDF%20Tools#tools">PDF tools</Link><Link to="/?category=Image%20Tools#tools">Image tools</Link><Link to="/tools/exam-photo">Exam photo</Link></div>
    <div><h2>FileFix</h2><Link to="/about">About</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms of Use</Link><Link to="/contact">Contact</Link></div>
    <div className="footer-note"><span className="eyebrow">HONEST BY DESIGN</span><p>Advanced tools are labeled unavailable when a reliable offline engine is not included.</p></div>
  </div><div className="container footer-bottom"><span>© {new Date().getFullYear()} FileFix</span><span>No accounts · no file uploads · no ad scripts</span></div></footer>;
}
