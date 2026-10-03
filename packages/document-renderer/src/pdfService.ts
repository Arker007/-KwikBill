import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { getPaperSize, getPrintSettings } from '@/features/invoices/utils/printSettings';

export interface PDFBuildOptions {
  printSettings?: any;
  invoiceOptions?: any;
  editingBill?: any;
  details?: any;
  profile?: any;
}

/**
 * Reads document stylesheets and collects CSS rule strings for inline injection into html2canvas clone.
 */
export const collectDocumentStyles = (): string => {
  const parts: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = sheet.cssRules;
      if (!rules) continue;
      for (const rule of Array.from(rules)) parts.push(rule.cssText);
    } catch {
      /* cross-origin (e.g. Google Fonts) - skip */
    }
  }
  return parts.join('\n');
};

/**
 * Builds a jsPDF document instance from an HTML invoice preview element.
 */
export const buildInvoicePDF = async (
  containerElement: HTMLElement,
  options: PDFBuildOptions = {}
): Promise<jsPDF> => {
  const printSettings = { ...getPrintSettings(), ...(options.printSettings || {}) };
  const invoiceOptions = options.invoiceOptions || {};
  const editingBill = options.editingBill;
  const details = options.details || {};
  const profile = options.profile || {};

  const scalerEl = containerElement.closest('.preview-scaler') as HTMLElement | null;
  const originalTransform = scalerEl ? scalerEl.style.transform : undefined;
  if (scalerEl) scalerEl.style.transform = 'none';

  try {
    const isThermalPdf = getPaperSize(invoiceOptions.paperSize, invoiceOptions).kind === 'thermal';
    const paperCfg = getPaperSize(invoiceOptions.paperSize, invoiceOptions);

    let pdf = new jsPDF({
      orientation: paperCfg.jsPdfOrientation || 'portrait',
      unit: 'mm',
      format: paperCfg.jsPdfFormat as any,
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfPageHeight = pdf.internal.pageSize.getHeight();
    const extraPages = Array.from(containerElement.querySelectorAll('[data-pdf-page]')) as HTMLElement[];

    const capScale = (n: number) => Math.min(6, Math.max(2, Math.round(n)));
    const qualityCfg: Record<string, { scale: number; imgFormat: string; quality: number }> = {
      draft: { scale: 3, imgFormat: 'PNG', quality: 1.0 },
      standard: { scale: capScale(Math.max(3.5, (window.devicePixelRatio || 1) * 2.5)), imgFormat: 'PNG', quality: 1.0 },
      hd: { scale: capScale(Math.max(4.5, (window.devicePixelRatio || 1) * 3.0)), imgFormat: 'PNG', quality: 1.0 },
    };
    const q = qualityCfg[printSettings.pdfQuality] || qualityCfg.standard;
    const renderScale = q.scale;
    const jpegQuality = q.quality;
    const imgFormat = q.imgFormat;

    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch {
        /* non-fatal */
      }
    }

    const domContainerWidth = containerElement.getBoundingClientRect().width || containerElement.scrollWidth;
    const domContainerHeight = containerElement.getBoundingClientRect().height || containerElement.scrollHeight;

    const computedBg = window.getComputedStyle(containerElement).backgroundColor;
    const bgToUse = computedBg && computedBg !== 'rgba(0, 0, 0, 0)' && computedBg !== 'transparent' ? computedBg : '#ffffff';

    const captureOptions = (el: HTMLElement) => ({
      scale: renderScale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      letterRendering: true,
      backgroundColor: bgToUse,
      imageTimeout: 15_000,
      width: Math.ceil(el.getBoundingClientRect().width || el.scrollWidth),
      height: Math.ceil(el.getBoundingClientRect().height || el.scrollHeight),
    });

    const collectRowBoundaries = (container: HTMLElement) => {
      const containerRect = container.getBoundingClientRect();
      const nodes = container.querySelectorAll(
        '.inv-table tbody tr, .inv-table thead tr, .inv-header, .inv-parties, ' +
          '.inv-footer-block, .inv-totals, [data-pdf-page-boundary]'
      );
      const set = new Set<number>([0]);
      nodes.forEach((el) => {
        const r = el.getBoundingClientRect();
        set.add(Math.max(0, r.bottom - containerRect.top));
        set.add(Math.max(0, r.top - containerRect.top));
      });
      return [...set].sort((a, b) => a - b);
    };

    const domBoundariesPx = collectRowBoundaries(containerElement);

    const rawScale = Number(printSettings.pdfFontScale);
    const pdfFontScaleFactor = isFinite(rawScale) && rawScale > 0 ? Math.max(0.7, Math.min(1.3, rawScale)) : 1.0;

    extraPages.forEach((el) => (el.style.display = 'none'));
    const mainCanvas = await html2canvas(containerElement, {
      ...captureOptions(containerElement),
      onclone: (clonedDoc) => {
        try {
          const css = collectDocumentStyles();
          if (css) {
            const styleEl = clonedDoc.createElement('style');
            styleEl.setAttribute('data-fgsb-inlined', '1');
            styleEl.textContent = css;
            (clonedDoc.head || clonedDoc.documentElement).appendChild(styleEl);
          }
        } catch {
          /* non-fatal */
        }
        const inv = clonedDoc.getElementById('invoice-preview');
        if (inv) {
          inv.style.overflow = 'visible';
          if (pdfFontScaleFactor !== 1.0) {
            inv.style.fontSize = `${pdfFontScaleFactor * 100}%`;
          }
        }
        clonedDoc.querySelectorAll('[data-pdf-page]').forEach((el: any) => (el.style.display = 'none'));
      },
    });
    extraPages.forEach((el) => (el.style.display = ''));

    const pageRecipes: any[] = [];

    const mTop = Math.max(0, Number(printSettings.marginTop) || 0);
    const mBottom = Math.max(0, Number(printSettings.marginBottom) || 0);
    const mLeft = Math.max(0, Number(printSettings.marginLeft) || 0);
    const mRight = Math.max(0, Number(printSettings.marginRight) || 0);

    const isHeaderOn = !isThermalPdf && !!printSettings.pageHeaderEnabled;
    const isFooterOn = !isThermalPdf && !!printSettings.pageNumbersEnabled;
    const pageHeaderReserve = isHeaderOn ? 12 : 0;
    const pageFooterReserve = isFooterOn ? 8 : 0;

    const availWidth = Math.max(20, pdfWidth - mLeft - mRight);
    const availHeightFull = Math.max(20, pdfPageHeight - mTop - mBottom);
    const availHeightMulti = Math.max(20, availHeightFull - pageHeaderReserve - pageFooterReserve);

    const contentWidth = availWidth;
    const contentHeightFull = availHeightFull;
    const contentHeightMulti = availHeightMulti;

    const contentXOffset = mLeft;
    const contentYOffset = mTop;
    const scaledImgHeight = (mainCanvas.height * contentWidth) / mainCanvas.width;

    if (scaledImgHeight <= contentHeightFull + 2) {
      const mainImg = mainCanvas.toDataURL(imgFormat === 'PNG' ? 'image/png' : 'image/jpeg', jpegQuality);
      const finalH = Math.min(scaledImgHeight, contentHeightFull);
      if (paperCfg.kind === 'thermal') {
        const thermalHeightMm = Math.max(30, Math.ceil(finalH + mTop + mBottom + 2));
        pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [paperCfg.widthMm, thermalHeightMm],
          compress: true,
        });
      }
      pdf.addImage(mainImg, imgFormat, contentXOffset, contentYOffset, contentWidth, finalH, undefined, 'MEDIUM');
      pageRecipes.push({ img: mainImg, y: contentYOffset, h: finalH, x: contentXOffset, w: contentWidth });
    } else {
      const domToCanvasScale = mainCanvas.width / domContainerWidth;
      const canvasBoundariesPx = domBoundariesPx.map((y) => y * domToCanvasScale);
      const totalCanvasHeightPx = mainCanvas.height;
      if (!canvasBoundariesPx.includes(totalCanvasHeightPx)) {
        canvasBoundariesPx.push(totalCanvasHeightPx);
      }
      canvasBoundariesPx.sort((a, b) => a - b);

      const pxPerMm = mainCanvas.width / contentWidth;
      const canvasHeightPage1Px = (contentHeightFull - (isFooterOn ? pageFooterReserve : 0)) * pxPerMm;
      const canvasHeightMultiPx = contentHeightMulti * pxPerMm;

      const pageSplits: { start: number; end: number }[] = [];
      let pageStart = 0;
      let pageIndex = 0;
      let safety = 0;

      while (pageStart < totalCanvasHeightPx && safety++ < 100) {
        const maxPageCanvasPx = pageIndex === 0 ? canvasHeightPage1Px : canvasHeightMultiPx;
        const naiveEnd = pageStart + maxPageCanvasPx;
        if (naiveEnd >= totalCanvasHeightPx) {
          pageSplits.push({ start: pageStart, end: totalCanvasHeightPx });
          break;
        }
        let safeEnd: number | null = null;
        for (let i = canvasBoundariesPx.length - 1; i >= 0; i--) {
          const b = canvasBoundariesPx[i];
          if (b <= naiveEnd + 1 && b > pageStart + 20) {
            safeEnd = b;
            break;
          }
        }
        if (safeEnd === null) safeEnd = naiveEnd;
        pageSplits.push({ start: pageStart, end: safeEnd });
        pageStart = safeEnd;
        pageIndex++;
      }

      for (let i = 0; i < pageSplits.length; i++) {
        const { start, end } = pageSplits[i];
        const cropHeight = end - start;
        if (cropHeight < 1) continue;
        const tmp = document.createElement('canvas');
        tmp.width = mainCanvas.width;
        tmp.height = cropHeight;
        const ctx = tmp.getContext('2d');
        if (ctx) {
          ctx.fillStyle = bgToUse;
          ctx.fillRect(0, 0, tmp.width, cropHeight);
          ctx.drawImage(mainCanvas, 0, -start);
        }
        const pageImg = tmp.toDataURL(imgFormat === 'PNG' ? 'image/png' : 'image/jpeg', jpegQuality);
        const pageMmHeight = (cropHeight * contentWidth) / mainCanvas.width;
        if (i > 0) pdf.addPage();
        const yForThisPage = contentYOffset + (i > 0 ? pageHeaderReserve : 0);
        pdf.addImage(pageImg, imgFormat, contentXOffset, yForThisPage, contentWidth, pageMmHeight, undefined, 'MEDIUM');
        pageRecipes.push({ img: pageImg, y: yForThisPage, h: pageMmHeight, x: contentXOffset, w: contentWidth });
      }
    }

    const extraYOffset = mTop + pageHeaderReserve;
    const extraMaxH = Math.max(20, pdfPageHeight - extraYOffset - mBottom - pageFooterReserve);
    for (const pageEl of extraPages) {
      const c = await html2canvas(pageEl, {
        ...captureOptions(pageEl),
      });
      const extraImg = c.toDataURL(imgFormat === 'PNG' ? 'image/png' : 'image/jpeg', jpegQuality);
      const extraH = Math.min((c.height * contentWidth) / c.width, extraMaxH);
      pdf.addPage();
      pdf.addImage(extraImg, imgFormat, contentXOffset, extraYOffset, contentWidth, extraH, undefined, 'MEDIUM');
      pageRecipes.push({ img: extraImg, y: extraYOffset, h: extraH, x: contentXOffset, w: contentWidth });
    }

    const ps = printSettings;
    if (ps.multiCopyEnabled && ps.multiCopyCount > 1) {
      for (let copyIdx = 1; copyIdx < ps.multiCopyCount; copyIdx++) {
        for (const recipe of pageRecipes) {
          pdf.addPage();
          pdf.addImage(
            recipe.img,
            imgFormat,
            recipe.x ?? contentXOffset,
            recipe.y,
            recipe.w ?? contentWidth,
            recipe.h,
            undefined,
            'MEDIUM'
          );
        }
      }
    }

    pageRecipes.length = 0;

    let rawText: string | null = null;
    if (!isThermalPdf && ps.watermarkEnabled) {
      if (ps.watermarkUseCustomText) {
        rawText = ps.watermarkCustomText ? ps.watermarkCustomText : null;
      } else {
        rawText = ps.watermarkText || null;
      }
    }
    if (rawText) {
      const text = String(rawText).toUpperCase();
      const opacity = Math.max(0, Math.min(1, (Number(ps.watermarkOpacity) || 15) / 100));
      const angle = Number(ps.watermarkAngle) || -35;
      const size = Number(ps.watermarkFontSize) || 80;
      const finalPages = pdf.getNumberOfPages();
      for (let p = 1; p <= finalPages; p++) {
        pdf.setPage(p);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(size);
        try {
          const gState = new (pdf as any).GState({ opacity });
          pdf.setGState(gState);
        } catch {
          /* no-op */
        }
        pdf.setTextColor(200, 200, 200);
        const cx = pdfWidth / 2;
        const cy = pdfPageHeight / 2;
        pdf.text(text, cx, cy, { align: 'center', angle });
        try {
          const gState = new (pdf as any).GState({ opacity: 1 });
          pdf.setGState(gState);
        } catch {
          /* no-op */
        }
        pdf.setTextColor(0);
      }
    }

    if (!isThermalPdf && ps.reprintLabelEnabled && Number(editingBill?.printedCount) > 0) {
      const label = `REPRINT · Copy #${(Number(editingBill.printedCount) || 0) + 1}`;
      const finalPages = pdf.getNumberOfPages();
      for (let p = 1; p <= finalPages; p++) {
        pdf.setPage(p);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(220, 38, 38);
        const w = pdf.getTextWidth(label) + 4;
        const x = pdfWidth - mRight - w;
        const y = Math.max(3, mTop - 2);
        pdf.setDrawColor(220, 38, 38);
        pdf.rect(x, y, w, 5, 'S');
        pdf.text(label, x + 2, y + 3.8);
        pdf.setTextColor(0);
      }
    }

    if (!isThermalPdf && (ps.invoiceQrEnabled || ps.invoiceBarcodeEnabled)) {
      const qrPayload = ps.invoiceQrUrl
        ? ps.invoiceQrUrl.replace(/\{invoice_number\}/g, encodeURIComponent(details.invoiceNumber || ''))
        : details.invoiceNumber || '';
      if (ps.invoiceQrEnabled && qrPayload) {
        try {
          const qrDataUrl = await QRCode.toDataURL(qrPayload, { errorCorrectionLevel: 'M', margin: 0, width: 200 });
          pdf.setPage(pdf.getNumberOfPages());
          const size = 16;
          const x = pdfWidth - mRight - size;
          const y = pdfPageHeight - mBottom - size;
          pdf.addImage(qrDataUrl, 'PNG', x, y, size, size);
          pdf.setFontSize(6);
          pdf.setTextColor(80);
          pdf.text('Verify invoice', x, y + size + 3);
          pdf.setTextColor(0);
        } catch {
          /* skip */
        }
      }
      if (ps.invoiceBarcodeEnabled && details.invoiceNumber) {
        pdf.setPage(pdf.getNumberOfPages());
        pdf.setFont('courier', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(0);
        pdf.text(String(details.invoiceNumber), mLeft, pdfPageHeight - mBottom - 2);
      }
    }

    if (!isThermalPdf && ps.feedbackQrEnabled && ps.feedbackQrUrl) {
      try {
        const dataUrl = await QRCode.toDataURL(ps.feedbackQrUrl, { errorCorrectionLevel: 'M', margin: 0, width: 200 });
        pdf.setPage(pdf.getNumberOfPages());
        const size = 14;
        const x = mLeft;
        const y = pdfPageHeight - mBottom - size;
        pdf.addImage(dataUrl, 'PNG', x, y, size, size);
        pdf.setFontSize(6);
        pdf.setTextColor(80);
        pdf.text(ps.feedbackQrLabel || 'Rate us', x, y + size + 3);
        pdf.setTextColor(0);
      } catch {
        /* skip */
      }
    }

    if (!isThermalPdf && (ps.pageNumbersEnabled || ps.pageHeaderEnabled) && pdf.getNumberOfPages() > 1) {
      const finalPages = pdf.getNumberOfPages();
      for (let p = 2; p <= finalPages; p++) {
        pdf.setPage(p);
        if (ps.pageHeaderEnabled && profile?.businessName) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8.5);
          pdf.setTextColor(80);
          pdf.text(profile.businessName, mLeft, mTop + 4);
          pdf.setDrawColor(200);
          pdf.setLineWidth(0.2);
          pdf.line(mLeft, mTop + 6, pdfWidth - mRight, mTop + 6);
          pdf.setTextColor(0);
        }
        if (ps.pageNumbersEnabled) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(120);
          pdf.text(`Page ${p} of ${finalPages}`, pdfWidth - mRight, pdfPageHeight - Math.max(2, mBottom / 2), { align: 'right' });
          pdf.setTextColor(0);
        }
      }
    }

    return pdf;
  } finally {
    if (scalerEl) scalerEl.style.transform = originalTransform !== undefined ? originalTransform : '';
  }
};

/**
 * Downloads a generated invoice PDF with specified filename.
 */
export const downloadInvoicePDF = async (
  containerElement: HTMLElement,
  fileName: string = 'invoice.pdf',
  options: PDFBuildOptions = {}
): Promise<void> => {
  const pdf = await buildInvoicePDF(containerElement, options);
  pdf.save(fileName);
};
