import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  A4_CONSTANTS,
  optimizeResumeLayout,
  calculateSmartPageSlices
} from './smartPagination';

/**
 * Production-Grade Smart Resume Pagination & One-Page PDF Layout Exporter
 * 
 * Capabilities:
 * - Smart One-Page Optimization for undergraduate/early-career resumes
 * - Safe typography enforcement (body font >= 10pt / 13.3px)
 * - Safe physical page margins (0.5in - 0.75in / 48px - 72px)
 * - Strict orphan heading protection (headings stay with first items)
 * - Breakable item-level pagination for multi-page resumes
 * - Interactive clickable hyperlinks mapped across all pages
 * - Complete preview isolation with reliable style restoration
 */
export const exportToPdf = async (targetOrResume = 'resume-preview-document', customFilename) => {
  let element = null;
  let resolvedFilename = customFilename;
  let resumeObj = null;

  // 1. Resolve DOM Element & Metadata
  if (typeof targetOrResume === 'string') {
    element = document.getElementById(targetOrResume) || document.querySelector(targetOrResume);
  } else if (targetOrResume instanceof HTMLElement) {
    element = targetOrResume;
  } else if (targetOrResume && typeof targetOrResume === 'object') {
    resumeObj = targetOrResume;
    const name = targetOrResume?.personal?.fullName || targetOrResume?.title || 'Resume';
    if (!resolvedFilename) {
      resolvedFilename = `${name.replace(/[^a-zA-Z0-9_-]/g, '_')}_Resume.pdf`;
    }
    element = document.getElementById('resume-preview-document') ||
              document.querySelector('.resume-sheet') ||
              document.querySelector('.canonical-resume') ||
              document.querySelector('.print-only-resume');
  }

  // Fallback lookup
  if (!element) {
    element = document.getElementById('resume-preview-document') ||
              document.querySelector('.resume-sheet') ||
              document.querySelector('.canonical-resume') ||
              document.querySelector('.print-only-resume');
  }

  if (!element) {
    throw new Error('Resume preview element not found.');
  }

  if (!resolvedFilename) {
    resolvedFilename = 'Resume.pdf';
  }
  if (!resolvedFilename.endsWith('.pdf')) {
    resolvedFilename += '.pdf';
  }

  // 2. Capture and temporarily normalize element styles for pixel-perfect snapshot
  const originalTransform = element.style.transform;
  const originalBoxShadow = element.style.boxShadow;
  const originalBorderRadius = element.style.borderRadius;
  const originalMargin = element.style.margin;

  const interactiveWrapper = element.closest('.interactive-preview');
  if (interactiveWrapper) {
    interactiveWrapper.classList.remove('interactive-preview');
  }

  element.style.transform = 'none';
  element.style.boxShadow = 'none';
  element.style.borderRadius = '0px';
  element.style.margin = '0';

  let restoreLayoutOptimization = () => {};

  try {
    const a4WidthMm = A4_CONSTANTS.WIDTH_MM;
    const a4HeightMm = A4_CONSTANTS.HEIGHT_MM;
    const a4Ratio = A4_CONSTANTS.ASPECT_RATIO; // ~1.4142

    const domWidthPx = element.offsetWidth || A4_CONSTANTS.STANDARD_WIDTH_PX;
    const maxPageDomHeightPx = Math.round(domWidthPx * a4Ratio);

    // 3. Apply Smart Layout Optimization (Comfortable -> Compact -> Dense -> Multi-Page)
    const layoutOptimization = optimizeResumeLayout(element, maxPageDomHeightPx);
    restoreLayoutOptimization = layoutOptimization.restore || (() => {});

    // 4. Extract all links from the DOM after layout optimization with exact relative coordinates
    const elemRect = element.getBoundingClientRect();
    const linkNodes = Array.from(element.querySelectorAll('a[href], [data-resume-url]'));
    const linkItems = linkNodes.map(node => {
      const rect = node.getBoundingClientRect();
      let rawUrl = node.getAttribute('data-resume-url') || node.getAttribute('href') || '';
      rawUrl = rawUrl.trim();
      
      let href = rawUrl;
      if (rawUrl.includes('@') && !rawUrl.startsWith('mailto:')) {
        href = `mailto:${rawUrl}`;
      } else if (/^\+?[0-9\s\-()]{7,}$/.test(rawUrl) && !rawUrl.startsWith('tel:')) {
        href = `tel:${rawUrl.replace(/\s+/g, '')}`;
      } else if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://') && !rawUrl.startsWith('mailto:') && !rawUrl.startsWith('tel:')) {
        href = `https://${rawUrl}`;
      }

      return {
        href,
        topPx: rect.top - elemRect.top,
        bottomPx: rect.bottom - elemRect.top,
        leftPx: rect.left - elemRect.left,
        widthPx: rect.width,
        heightPx: rect.height
      };
    }).filter(item => item.href && item.widthPx > 0 && item.heightPx > 0);

    // 5. Calculate Intelligent Page Slices with Item-Level Breakability & Orphan Protection
    const pageSlices = calculateSmartPageSlices(element, maxPageDomHeightPx);

    // 6. High-resolution canvas capture
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // Set Document Properties / Metadata for ATS parsers
    const candidateName = resumeObj?.personal?.fullName || element.querySelector('h1')?.textContent || 'Candidate';
    const candidateTitle = resumeObj?.personal?.title || element.querySelector('header [data-section="personal"]')?.textContent || 'Resume';
    pdf.setProperties({
      title: `${candidateName} - Resume`,
      subject: `${candidateTitle} Professional Resume`,
      author: candidateName,
      keywords: 'Resume, Curriculum Vitae, CV, ATS-Optimized, Career',
      creator: 'ResumeBuilder AI'
    });

    const pxScale = canvas.width / domWidthPx;

    // 7. Render each slice onto its corresponding A4 PDF page
    for (let i = 0; i < pageSlices.length; i++) {
      const slice = pageSlices[i];
      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      const sliceTopCanvasPx = Math.round(slice.topDomPx * pxScale);
      const sliceHeightCanvasPx = Math.round(slice.heightDomPx * pxScale);

      // Create a clean cropped canvas for this specific page slice
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.round(maxPageDomHeightPx * pxScale);
      const ctx = pageCanvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

      ctx.drawImage(
        canvas,
        0,
        sliceTopCanvasPx,
        canvas.width,
        Math.min(sliceHeightCanvasPx, canvas.height - sliceTopCanvasPx),
        0,
        0,
        canvas.width,
        sliceHeightCanvasPx
      );

      const sliceImgData = pageCanvas.toDataURL('image/png', 1.0);
      const renderedHeightMm = (slice.heightDomPx / domWidthPx) * a4WidthMm;

      pdf.addImage(
        sliceImgData,
        'PNG',
        0,
        0,
        a4WidthMm,
        Math.min(renderedHeightMm, a4HeightMm),
        undefined,
        'FAST'
      );

      // 8. Add interactive clickable links on this page
      const pageIndex = i + 1;
      pdf.setPage(pageIndex);

      linkItems.forEach(link => {
        if (link.topPx >= (slice.topDomPx - 2) && link.topPx < (slice.bottomDomPx - 2)) {
          const relTopPx = link.topPx - slice.topDomPx;
          const xMm = (link.leftPx / domWidthPx) * a4WidthMm;
          const yMm = (relTopPx / domWidthPx) * a4WidthMm;
          const wMm = (link.widthPx / domWidthPx) * a4WidthMm;
          const hMm = (link.heightPx / domWidthPx) * a4WidthMm;

          if (yMm + hMm <= a4HeightMm) {
            pdf.link(xMm, yMm, wMm, hMm, { url: link.href });
          }
        }
      });
    }

    pdf.save(resolvedFilename);
    return {
      success: true,
      filename: resolvedFilename,
      pageCount: pageSlices.length,
      densityProfile: layoutOptimization.profile,
      isSinglePage: pageSlices.length === 1
    };
  } finally {
    // Restore layout optimization styles
    try {
      restoreLayoutOptimization();
    } catch {}

    // Restore original element styles
    element.style.transform = originalTransform;
    element.style.boxShadow = originalBoxShadow;
    element.style.borderRadius = originalBorderRadius;
    element.style.margin = originalMargin;

    if (interactiveWrapper) {
      interactiveWrapper.classList.add('interactive-preview');
    }
  }
};
