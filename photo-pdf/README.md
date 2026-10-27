# FileFix — PDF & Image Tools

A React and Vite single-page app. Supported PDF and image operations run in the browser; there is no account, server, upload queue, paid API, or database. `public/_redirects` keeps tool links working on static hosts.

## Run it on your computer

1. Install Node.js 22.12 or newer.
2. Open Terminal in this `photo-pdf` folder.
3. Run `npm ci` once to install the locked dependencies.
4. Run `npm run dev` and open the local address Vite prints (usually `http://localhost:5173`).
5. Run `npm test` for the automated checks and `npm run build` to create the deployable `dist` folder. Use `npm run preview` to inspect that build locally.

## Check the main workflows

Use your own or non-sensitive sample files; avoid uploading confidential documents to public test sites.

1. **Resize:** open `/tools/resize-image`, choose an image, keep “Maintain aspect ratio” on, change the width, and create the image. Confirm the output dimensions and preview.
2. **Compress:** open `/tools/compress-image`, choose a JPG or PNG, set a target size, and compress. Compare the reported input and output sizes. Compression can make a file larger or miss the requested target; the result reports what happened.
3. **Rename a download:** after any tool creates a file, edit its name in the **File name** field before downloading. The original file extension is kept.
4. **Print to PDF:** open `/tools/html-to-pdf`, enter a title and a few lines or select a photo, then select **Print / Save as PDF**. In the browser print dialog choose **Save as PDF**, save the file, and open it to check the printed page. This uses the browser’s native print window.
5. **PDF checks:** merge two small PDFs, then try page ranges such as `1-2` and `3`; open each download and confirm the pages. Try removing pages while keeping at least one page.
6. **Mobile/accessibility:** resize the browser to a narrow screen, open the menu, tab through the upload controls, and check visible focus outlines and readable previews.

`npm test` checks the 45 tool routes, page range parsing, image fit calculations, measured compression reporting, and PDF merge/extract/remove/rotate/page-number operations. A graphical browser is needed to check canvas output and confirm the native print dialog; use the steps above for those checks.

## Deploy free as a static site

Cloudflare Pages can build this project from a Git repository without a backend:

1. Push this folder to a GitHub or GitLab repository.
2. In Cloudflare, open **Workers & Pages**, create a **Pages** project, and connect that repository.
3. Set the project root to `photo-pdf` if the repository contains this folder inside another folder. If this folder is the repository root, leave the root directory empty.
4. Set **Build command** to `npm run build` and **Build output directory** to `dist`. No environment variables are required.
5. Deploy, then open the site and test a direct link such as `/tools/resize-image` and `/tools/html-to-pdf`.

Cloudflare’s React/Vite preset uses `npm run build` and `dist`; the included `_redirects` file also provides an SPA fallback for hosts that need one. Static Pages assets are currently free on Cloudflare’s Free plan, subject to its current build and file limits. See [Cloudflare Pages build settings](https://developers.cloudflare.com/pages/configuration/build-configuration/), [SPA routing](https://developers.cloudflare.com/pages/configuration/serving-pages/), and [Free plan limits](https://developers.cloudflare.com/pages/platform/limits/).

## What this version does not do

- Office file conversions, PDF/A, encryption or password removal, secure redaction, OCR, PDF comparison, and translation need engines that are not bundled. Those catalog routes say they are unavailable.
- **Print to PDF** prints entered text and one selected image through the browser. It does not import arbitrary HTML files or another website.
- PDF compression only rewrites a readable PDF; it does not recompress embedded images. Repair only resaves files the parser can read.
- PDF text export and the local summary need selectable text; they do not run OCR. The summary is a basic extractive result, not generative AI.
- Crop PDF changes the visible crop box but does not erase hidden content. Image signatures are not certificate-backed digital signatures. Review documents after processing.
- Each file is limited to 100 MB; images are limited to 25 megapixels and 12,000 pixels per side. Large files can still use substantial browser memory.
- Photo tools use dimensions and limits you enter; no current exam or passport authority presets are claimed.

There is no production domain yet, so no domain-specific sitemap is included. Add one after choosing the final public URL.
