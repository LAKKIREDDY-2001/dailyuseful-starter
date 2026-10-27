# FileFix — Free PDF & Image Tools

A browser-based React/Vite toolkit. Supported PDF and image operations run locally; no paid APIs, backend, account, or database are required. Advanced conversions that need unavailable engines are marked clearly.

## Run and test

1. Install Node.js 22.12 or newer.
2. In Terminal, open the photo-pdf folder.
3. Run npm ci, then npm run dev. Open the local address Vite prints.
4. Run npm test for automated checks. Run npm run build to create the production site in photo-pdf/dist; use npm run preview to inspect it locally.
5. In a graphical browser, check image resize/compression, edit a generated filename, and print text or a photo to PDF from /tools/html-to-pdf.

## Deploy to Cloudflare Pages

1. Connect this repository to a new Pages project.
2. Set the project root to photo-pdf.
3. Set the build command to npm run build and output directory to dist.
4. Deploy and check direct links such as /tools/resize-image and /tools/html-to-pdf.

No environment variables are needed. The current Cloudflare Pages Free plan has limits; check [the official limits](https://developers.cloudflare.com/pages/platform/limits/) before deploying. Build settings are documented in the [Cloudflare Pages guide](https://developers.cloudflare.com/pages/configuration/build-configuration/).

## Limits

- Image and PDF processing uses browser memory; large files may be slow or exceed device capacity.
- PDF compression rewrites structure but does not recompress embedded images. Some operations, including office conversion, encryption, OCR, PDF/A, secure redaction, comparison, and translation, are unavailable.
- Print to PDF uses the browser print dialog and prints text or one selected photo; it does not import arbitrary websites or HTML files.
- Exam and passport photos use dimensions you enter; verify the current authority’s requirements.
