import {
  Archive, ArrowDown, ArrowRight, ArrowUp, BookOpen, Check, ChevronDown, CircleHelp, Code, Columns2,
  ContactRound, Copy, Crop, Download, ExternalLink, FileCode2, FileImage, FileMinus, FileOutput,
  FilePlus2, FileSpreadsheet, FileText, FormInput, House, IdCard, Image, ImageDown, Images,
  Languages, ListCollapse, ListOrdered, LockKeyhole, Menu, Minimize2, Moon, Palette,
  PanelsTopLeft, Pencil, Presentation, Ratio, RotateCw, Ruler, Scan, ScanEye, ScanLine,
  ScanText, Search, ShieldCheck, Signature, SlidersHorizontal, Sparkles, Stamp, Sun, Table2,
  Trash2, UnlockKeyhole, Upload, WandSparkles, Wrench,
} from 'lucide-react';

const iconMap = {
  archive: Archive, 'arrow-down': ArrowDown, 'arrow-right': ArrowRight, book: BookOpen,
  check: Check, columns: Columns2, contact: ContactRound, copy: Copy, crop: Crop,
  download: Download, code: Code, 'file-code': FileCode2, 'file-image': FileImage,
  'file-minus': FileMinus, 'file-output': FileOutput, 'file-plus': FilePlus2,
  'file-sheet': FileSpreadsheet, 'file-text': FileText, form: FormInput, home: House,
  id: IdCard, image: Image, 'image-down': ImageDown, images: Images, language: Languages,
  list: ListCollapse, 'list-ordered': ListOrdered, lock: LockKeyhole, menu: Menu,
  compress: Minimize2, moon: Moon, palette: Palette, organize: PanelsTopLeft,
  'panels-top-left': PanelsTopLeft, edit: Pencil, pencil: Pencil, presentation: Presentation,
  ratio: Ratio, rotate: RotateCw, ruler: Ruler, 'minimize-2': Minimize2,
  'lock-keyhole': LockKeyhole, 'unlock-keyhole': UnlockKeyhole, 'columns-2': Columns2,
  'list-collapse': ListCollapse, 'id-card': IdCard, 'contact-round': ContactRound,
  sheet: FileSpreadsheet, scan: Scan, 'scan-eye': ScanEye, 'scan-line': ScanLine,
  'scan-text': ScanText, search: Search, shield: ShieldCheck, signature: Signature,
  sliders: SlidersHorizontal, sparkles: Sparkles, stamp: Stamp, sun: Sun, table: Table2,
  trash: Trash2, unlock: UnlockKeyhole, upload: Upload, wand: WandSparkles, wrench: Wrench,
  'arrow-up': ArrowUp, 'circle-help': CircleHelp, 'external-link': ExternalLink,
  'chevron-down': ChevronDown,
};

export function iconFor(name, props = {}) {
  const Icon = iconMap[name] || FileText;
  return <Icon aria-hidden="true" strokeWidth={1.8} {...props} />;
}
