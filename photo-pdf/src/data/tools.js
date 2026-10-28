export const categories = [
  'All Tools', 'Workflows', 'Organize PDF', 'Optimize PDF', 'Convert PDF', 'Edit PDF',
  'PDF Security', 'PDF Intelligence', 'Image Resize', 'Image Compression', 'Image Conversion', 'Exam Photo & Signature',
];

const definitions = [
  ['merge-pdf','Merge PDF','Combine PDFs in the order you choose.','Organize PDF','files'],
  ['split-pdf','Split PDF','Save page ranges as separate PDF files.','Organize PDF','file-output'],
  ['organize-pdf','Organize PDF','Reorder, rotate, and remove pages.','Organize PDF','panels-top-left'],
  ['remove-pdf-pages','Remove PDF Pages','Delete selected pages and keep the rest.','Organize PDF','file-minus'],
  ['extract-pdf-pages','Extract PDF Pages','Create a PDF from selected pages.','Organize PDF','copy'],
  ['rotate-pdf','Rotate PDF','Rotate pages and export a new document.','Organize PDF','rotate-cw'],
  ['page-numbers','Page Numbers','Add page numbers with simple placement controls.','Organize PDF','list-ordered'],
  ['scan-to-pdf','Scan to PDF','Turn document photos into an ordered PDF.','Workflows','scan-line'],
  ['crop-pdf','Crop PDF','Change the visible page area.','Organize PDF','crop'],
  ['compress-pdf','Compress PDF','Rewrite a PDF and compare the actual file size.','Optimize PDF','minimize-2'],
  ['repair-pdf','Repair PDF','Validate and resave PDFs this browser can read.','Optimize PDF','wrench'],
  ['pdf-to-jpg','PDF to JPG','Render PDF pages as downloadable images.','Convert PDF','image'],
  ['jpg-to-pdf','JPG to PDF','Arrange images and create a PDF.','Convert PDF','images'],
  ['word-to-pdf','Word to PDF','Advanced conversion — not available in this free version.','Convert PDF','file-text'],
  ['pdf-to-word','PDF to Word','Advanced conversion — not available in this free version.','Convert PDF','file-text'],
  ['excel-to-pdf','Excel to PDF','Advanced conversion — not available in this free version.','Convert PDF','table'],
  ['pdf-to-excel','PDF to Excel','Advanced conversion — not available in this free version.','Convert PDF','sheet'],
  ['powerpoint-to-pdf','PowerPoint to PDF','Advanced conversion — not available in this free version.','Convert PDF','presentation'],
  ['pdf-to-powerpoint','PDF to PowerPoint','Advanced conversion — not available in this free version.','Convert PDF','presentation'],
  ['html-to-pdf','Print to PDF','Print text and a photo to PDF using your browser.','Convert PDF','code'],
  ['pdf-to-pdfa','PDF to PDF/A','Archival validation and conversion are not available.','Convert PDF','archive'],
  ['pdf-to-markdown','PDF to Markdown','Extract selectable text into a simple Markdown file.','Convert PDF','file-code'],
  ['edit-pdf','Edit PDF','Add a text note to a selected page.','Edit PDF','pencil'],
  ['watermark-pdf','Watermark','Add a text watermark to every page.','Edit PDF','stamp'],
  ['sign-pdf','Sign PDF','Place a signature image on one page.','Edit PDF','signature'],
  ['pdf-forms','PDF Forms','Inspect and fill supported interactive form fields.','Edit PDF','form-input'],
  ['protect-pdf','Protect PDF','Password encryption is not available in this version.','PDF Security','lock-keyhole'],
  ['unlock-pdf','Unlock PDF','Password removal is not available in this version.','PDF Security','unlock'],
  ['redact-pdf','Redact PDF','Secure content removal is not available in this version.','PDF Security','scan-eye'],
  ['ocr-pdf','OCR PDF','Local OCR engine is not included in this version.','PDF Intelligence','scan-text'],
  ['compare-pdf','Compare PDF','Side-by-side page comparison is planned.','PDF Intelligence','columns-2'],
  ['ai-summarizer','Local PDF Summary','Extract a short local summary from selectable text.','PDF Intelligence','list-collapse'],
  ['translate-pdf','Translate PDF','Offline translation models are not included.','PDF Intelligence','languages'],
  ['resize-image','Resize Image','Set exact pixel dimensions and keep proportions.','Image Resize','scan'],
  ['aspect-ratio','Aspect Ratio & Frame Resizer','Fit, crop, or stretch to a preset or custom frame.','Image Resize','ratio'],
  ['crop-image','Crop Image','Crop to an exact size and aspect ratio.','Image Resize','crop'],
  ['compress-image','Compress Image','Choose image format and quality; see measured size.','Image Compression','image-down'],
  ['exam-photo','Exam Photo Maker','Prepare a photo to specifications you enter.','Exam Photo & Signature','id-card'],
  ['passport-photo','Passport Photo Maker','Set custom dimensions; verify official requirements.','Exam Photo & Signature','contact-round'],
  ['signature-resizer','Signature Resizer','Crop and resize a signature image.','Exam Photo & Signature','signature'],
  ['image-to-jpg','Image to JPG','Convert a browser-supported image to JPEG.','Image Conversion','file-image'],
  ['image-to-png','Image to PNG','Convert a browser-supported image to PNG.','Image Conversion','file-image'],
  ['image-to-webp','Image to WebP','Convert a browser-supported image to WebP.','Image Conversion','file-image'],
  ['image-dimensions','Image Dimensions Checker','Inspect image size and pixel dimensions.','Image Conversion','ruler'],
  ['background-color','Background Color Changer','Place an image over a solid canvas color.','Image Conversion','palette'],
];

export const tools = definitions.map(([id, name, description, category, icon]) => ({ id, name, description, category, icon, path: `/tools/${id}` }));
export const toolsById = Object.fromEntries(tools.map((tool) => [tool.id, tool]));

export const supportedTools = new Set([
  'merge-pdf','split-pdf','organize-pdf','remove-pdf-pages','extract-pdf-pages','rotate-pdf','page-numbers','html-to-pdf',
  'scan-to-pdf','crop-pdf','compress-pdf','repair-pdf','pdf-to-jpg','jpg-to-pdf','pdf-to-markdown',
  'edit-pdf','watermark-pdf','sign-pdf','pdf-forms','ai-summarizer',
  'resize-image','aspect-ratio','crop-image','compress-image','exam-photo','passport-photo','signature-resizer',
  'image-to-jpg','image-to-png','image-to-webp','image-dimensions','background-color',
]);

export const toolNotes = {
  'compress-pdf': 'This safe rewrite can remove some structural overhead, but it does not re-encode embedded images. A smaller result is not guaranteed.',
  'html-to-pdf': 'Uses your browser’s print feature for text and one selected image. Choose “Save as PDF” in the print dialog. It does not import arbitrary websites or HTML files.',
  'repair-pdf': 'Recovery only works when pdf-lib can parse the document. It cannot reconstruct missing or severely damaged PDF data.',
  'crop-pdf': 'Cropping changes the visible page box. It does not securely erase hidden content. Do not use it to remove sensitive information.',
  'pdf-to-markdown': 'Text extraction keeps basic page order only. Layout, tables, and images are not preserved.',
  'sign-pdf': 'This places an image of a signature. It is not a certificate-backed digital signature or identity verification.',
  'pdf-forms': 'Only standard interactive AcroForm fields supported by pdf-lib can be inspected or filled.',
  'ai-summarizer': 'This is a local extractive summary of selectable text, not a generative AI model. Scanned pages need OCR, which is not included.',
  'background-color': 'This changes the canvas behind transparent pixels. It does not detect or replace the background in a photograph.',
  'exam-photo': 'No authority presets are bundled. Enter dimensions from the current official application specifications.',
  'passport-photo': 'Country and application requirements differ. Verify the current official rules before using an export.',
};


/*
 * Practical, tool-specific guidance helps visitors understand the workflow and limitations
 * before processing important documents. Keep instructions aligned with actual browser features.
 */
export const toolGuides = {
  'merge-pdf': {
    heading: 'How to merge PDF files online',
    intro: 'Combine multiple PDF documents into one file directly in your browser. Arrange the files in the order you want them to appear before exporting.',
    steps: [
      { title: 'Choose your PDF files', text: 'Select two or more PDF documents from your device. Keep the original files in case you need to start again.' },
      { title: 'Check the order', text: 'Review the selected file list and move files into the order you want. The first file becomes the beginning of the combined document.' },
      { title: 'Create and download the PDF', text: 'Run the merge action, then download the combined file and open it to check page order and formatting.' }
    ],
    tip: 'If a document contains confidential information, use a device you trust and review the file before sharing the merged result.',
    faqs: [
      { q: 'Can I combine more than two PDFs?', a: 'Yes. Select multiple PDF files. Very large documents may use substantial browser memory, so try smaller batches if processing fails.' },
      { q: 'Will merging reduce file size?', a: 'Merging combines documents; it does not promise compression. The final file may be larger than any individual input.' },
      { q: 'Are my PDFs uploaded?', a: 'This tool is designed to process selected files in your browser rather than sending them to a FileFix upload server. You can keep your originals on your device.' }
    ]
  },
  'compress-pdf': {
    heading: 'How to compress a PDF file',
    intro: 'Use this tool to rewrite a PDF and compare the actual output size with the original. It can remove some structural overhead, but it does not re-encode embedded images.',
    steps: [
      { title: 'Select a PDF', text: 'Choose the document you want to reduce. Keep an untouched copy of the original.' },
      { title: 'Run the compression rewrite', text: 'Start processing and wait for the browser to create a new PDF file.' },
      { title: 'Compare sizes and check quality', text: 'Review the measured before-and-after file sizes, download the result, and open it to make sure the pages still look correct.' }
    ],
    tip: 'This tool may not make every PDF smaller, especially PDFs that are already optimized or contain large embedded images. Use the reported file size rather than assuming a reduction.',
    faqs: [
      { q: 'Why did my PDF not get smaller?', a: 'The tool rewrites the PDF structure but does not re-encode embedded images. Some PDFs have little removable overhead, so the result may be the same size or larger.' },
      { q: 'Will text and images remain the same quality?', a: 'The tool does not intentionally downsample embedded images. Still, open and review the exported document before using it.' },
      { q: 'Is there a guaranteed target size?', a: 'No. The result depends on the source PDF structure. This version does not guarantee a specific size or percentage reduction.' }
    ]
  },
  'split-pdf': {
    heading: 'How to split a PDF into separate files',
    intro: 'Extract selected page ranges from a PDF when you need only certain pages. Check the page numbering carefully before exporting.',
    steps: [
      { title: 'Upload your PDF', text: 'Choose the source document and wait for the page information to load.' },
      { title: 'Enter the page range', text: 'Specify the page or range you want to extract using the format shown in the tool. Confirm the range matches the pages you need.' },
      { title: 'Export and verify', text: 'Create the output file, download it, and open it to confirm that the expected pages are present.' }
    ],
    tip: 'PDF page numbers may differ from printed page numbers inside a document. Use the PDF viewer’s page count when selecting ranges.',
    faqs: [
      { q: 'Can I extract one page?', a: 'Yes. Enter the single page number in the page-range control, then export and check the resulting PDF.' },
      { q: 'Does splitting change the original?', a: 'The tool creates a separate output file. Keep your original as a backup.' },
      { q: 'Why did my page range fail?', a: 'Check that the range uses the format shown in the interface and that every requested page exists in the source PDF.' }
    ]
  },
  'jpg-to-pdf': {
    heading: 'How to convert JPG images to PDF',
    intro: 'Place supported images into a single PDF document. This is useful for combining scanned pages, receipts, or photos into one file.',
    steps: [
      { title: 'Select your images', text: 'Choose the JPG or PNG images you want to include. Select them in the order you want the pages to appear.' },
      { title: 'Review the sequence', text: 'Check the selected image list before creating the PDF. Use clear, correctly oriented source images for the best result.' },
      { title: 'Create and inspect the PDF', text: 'Generate the PDF, download it, and open it to confirm that every page is readable and in the right order.' }
    ],
    tip: 'If you are preparing documents for an official application, check the required page size, image clarity, and file-size limit before submitting.',
    faqs: [
      { q: 'Can I put several photos into one PDF?', a: 'Yes. Select multiple supported images and arrange them in the order you want.' },
      { q: 'Will the PDF look exactly like the original photo?', a: 'The image is placed on a PDF page, so page dimensions and scaling can affect how it appears. Review the exported PDF before sharing.' },
      { q: 'Which image formats are supported?', a: 'This version accepts JPEG and PNG images in this workflow. Convert unsupported formats to one of these formats first.' }
    ]
  },
  'pdf-to-jpg': {
    heading: 'How to convert PDF pages to JPG images',
    intro: 'Render pages from a PDF as image files for previewing, sharing, or use in image-based workflows.',
    steps: [
      { title: 'Choose the PDF', text: 'Select the PDF document and wait for the pages to load.' },
      { title: 'Choose the pages and settings', text: 'Use the available page and scale controls. Higher render scales can produce larger images and use more memory.' },
      { title: 'Download and check the images', text: 'Export the JPG files and inspect text, edges, and image clarity before using them elsewhere.' }
    ],
    tip: 'JPG is a lossy image format and does not preserve selectable PDF text. Keep the original PDF if you need searchable or accessible text.',
    faqs: [
      { q: 'Does each PDF page become an image?', a: 'The tool renders PDF pages as images. Review the exported files to ensure the expected pages were included.' },
      { q: 'Why are the output images large?', a: 'Image dimensions and render scale affect file size. Lowering the scale can reduce size but may make small text harder to read.' },
      { q: 'Can I search text in the JPG?', a: 'No. A JPG is an image, not a searchable PDF. Keep the original document if you need selectable text.' }
    ]
  },
  'resize-image': {
    heading: 'How to resize an image to exact dimensions',
    intro: 'Change an image’s pixel width and height for web forms, documents, or everyday use. Keep the proportions locked when you do not want the image to stretch.',
    steps: [
      { title: 'Choose an image', text: 'Select a supported image file and note its original width and height.' },
      { title: 'Enter the new dimensions', text: 'Type the desired pixel width and height. Keep the aspect ratio locked to preserve proportions, or unlock it only when stretching is intentional.' },
      { title: 'Export and check the result', text: 'Create the resized image, download it, and verify the dimensions and appearance.' }
    ],
    tip: 'Resizing changes pixel dimensions; it does not automatically meet every website or government application’s photo requirements. Check the current official specifications.',
    faqs: [
      { q: 'What does keeping the aspect ratio mean?', a: 'It preserves the relationship between width and height so the image is less likely to look stretched or squashed.' },
      { q: 'Will resizing improve image quality?', a: 'Resizing does not add detail that was not in the original. Enlarging a small image may make it look soft or pixelated.' },
      { q: 'How do I choose the right dimensions?', a: 'Use the pixel dimensions requested by the destination website or form. If there is no requirement, choose dimensions suitable for how the image will be displayed.' }
    ]
  },
  'compress-image': {
    heading: 'How to reduce image file size',
    intro: 'Adjust image format and quality to create a smaller file. The result reports its measured size, because not every image becomes smaller with every setting.',
    steps: [
      { title: 'Choose an image', text: 'Select the image you want to optimize and note its original file size.' },
      { title: 'Choose format and quality', text: 'Use the available output format and quality settings. Lower quality can reduce file size but may introduce visible artifacts.' },
      { title: 'Compare and download', text: 'Generate the output, compare the actual sizes, and inspect the image at normal viewing size before using it.' }
    ],
    tip: 'Keep the original image. JPEG is useful for photographs but does not preserve transparency; PNG is useful when transparency matters, though files can be larger.',
    faqs: [
      { q: 'How much smaller will my image become?', a: 'There is no fixed reduction. It depends on the original image, format, dimensions, and quality setting.' },
      { q: 'Will compression reduce image quality?', a: 'Lossy formats and lower quality settings can reduce detail. Compare the exported image with the original before using it.' },
      { q: 'Why is the output file larger?', a: 'The selected format or encoding settings may be less efficient for that particular image. Try another supported format or quality setting and compare the measured sizes.' }
    ]
  },
  'crop-image': {
    heading: 'How to crop an image cleanly',
    intro: 'Crop an image to focus on the subject or fit a target aspect ratio. Cropping removes the areas outside the chosen frame from the exported image.',
    steps: [
      { title: 'Select your image', text: 'Choose the photo and wait for the preview to load.' },
      { title: 'Set the crop or aspect ratio', text: 'Adjust the frame around the important content. Check that faces, text, and other required details remain inside the crop.' },
      { title: 'Export and review', text: 'Download the cropped image and check the final edges and dimensions.' }
    ],
    tip: 'For official photos, confirm the current required framing and dimensions with the relevant authority before submitting.',
    faqs: [
      { q: 'Does cropping change the original file?', a: 'The tool exports a new image. Keep the original so you can adjust the crop again if needed.' },
      { q: 'What is an aspect ratio?', a: 'It is the relationship between image width and height, such as 1:1 for a square or 4:3 for a landscape frame.' },
      { q: 'Can cropping securely remove private information?', a: 'Cropping changes the exported visible image, but do not rely on it as a secure redaction method for sensitive information.' }
    ]
  }
};
