# DailyUseful — two static websites

The projects are independent and need no paid API, account system, database, or backend. FileFix is a React/Vite app; IPO Allotment Helper remains plain HTML, CSS, and browser JavaScript.

## Projects

### Photo & PDF Utility — photo-pdf/

FileFix includes browser-local PDF and image tools. Its Print to PDF tool prints entered text or a selected photo through the browser’s native print dialog. Some advanced conversions are marked unavailable instead of showing nonworking tools.

### IPO Allotment Helper — ipo-helper/

The helper links to official status pages and lets you save multiple issue names, manually entered dates, and checklist ticks in that browser’s local storage. It does not fetch current IPOs, dates, subscription figures, or results. Do not enter PAN, application numbers, bank details, or UPI information in the helper.

## Test locally

1. Install Node.js 22.12 or newer.
2. In Terminal, open the photo-pdf folder, run npm ci, then npm run dev. Open the local address Vite prints.
3. Run npm test and npm run build in photo-pdf. npm run preview serves the production build locally.
4. On FileFix, test image resizing and compression, then /tools/html-to-pdf: enter text, print, choose Save as PDF, and open the saved document.
5. To test the IPO site, from the folder containing both projects run python3 -m http.server 8000, then open http://localhost:8000/ipo-helper/.
6. Save two made-up issue labels and dates in the IPO tracker, refresh, remove one, and verify the other remains. Toggle checklist items, refresh, and confirm they persist. Confirm no current issue data appears.
7. Repeat both sites at a narrow mobile viewport and keyboard through their controls. Stop the local server with Ctrl+C.

Use non-sensitive sample files. Local image/PDF tools can use substantial device memory, and the native print dialog depends on browser support.

## Free static hosting

Deploy the projects separately so each has the correct site root.

**FileFix on Cloudflare Pages**

1. Push the repository to GitHub or GitLab and create a Pages project connected to it.
2. Set the root directory to photo-pdf if the project is inside the repository; otherwise leave it empty.
3. Set the build command to npm run build and output directory to dist. No environment variables are required.
4. Deploy and test direct routes such as /tools/resize-image and /tools/html-to-pdf.

**IPO Helper on Cloudflare Pages**

1. Create a separate Pages project.
2. For direct upload, upload the contents of ipo-helper/ with index.html at the published root; or use Git integration with ipo-helper as the project root and no build command.
3. Deploy and test the tracker and external official links.

The current Cloudflare Pages Free plan has build and file limits, which can change; review the [official limits](https://developers.cloudflare.com/pages/platform/limits/). The FileFix project includes a static-host route fallback. For current build settings see [Cloudflare Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/).

## Limits

- FileFix processes supported files in the browser; large files can use substantial memory. Office conversions, OCR, PDF password protection/removal, secure redaction, PDF/A, comparison, and translation are unavailable.
- Its print tool prints text entered in FileFix through the browser; it does not import arbitrary HTML or another website.
- Image and exam-photo outputs use dimensions you enter. Verify the current authority requirements yourself.
- IPO issue names and dates are manual reminders only. The tracker stores on the current browser and origin; it does not sync or back up. Registrar URLs and processes can change, so verify them using the issuer documents and official sites.
- Neither site provides investment advice or checks allotment results. Verify dates and results with the issuer, exchange, registrar, broker, or bank.
