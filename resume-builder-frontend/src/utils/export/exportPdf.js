import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * High-Fidelity 1:1 ISO A4 PDF Exporter with Intelligent Page Break Slicing,
 * Per-Page Border Preservation, and Interactive Clickable Hyperlink Annotations.
 */
export const exportToPdf = async (targetOrResume = 'resume-preview-document', customFilename) => {
  let element = null;
  let resolvedFilename = customFilename;

  // 1. Resolve DOM Element
  if (typeof targetOrResume === 'string') {
    element = document.getElementById(targetOrResume) || document.querySelector(targetOrResume);
  } else if (targetOrResume instanceof HTMLElement) {
    element = targetOrResume;
  } else if (targetOrResume && typeof targetOrResume === 'object') {
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

  try {
    // 3. Extract all links from the DOM BEFORE html2canvas rendering
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

    // 4. Extract logical break candidate elements (projects, experiences, educations, headers)
    const breakCandidates = Array.from(element.querySelectorAll(
      '.experience-item, .project-item, .education-item, .certification-item, .publication-item, .award-item, .volunteer-item, .custom-item, .resume-section, section, h2, h3, tr'
    )).map(node => {
      const rect = node.getBoundingClientRect();
      return {
        topPx: rect.top - elemRect.top,
        bottomPx: rect.bottom - elemRect.top,
        heightPx: rect.height
      };
    }).filter(item => item.heightPx > 0);

    // 5. High-resolution canvas capture
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

    const a4WidthMm = 210;
    const a4HeightMm = 297;
    const a4Ratio = a4HeightMm / a4WidthMm; // ~1.4142

    const domWidthPx = element.offsetWidth || 794;
    const domHeightPx = element.scrollHeight;
    const maxPageDomHeightPx = domWidthPx * a4Ratio;

    // 6. Calculate intelligent slice cut points
    const pageSlices = [];
    let currentTopDomPx = 0;

    while (currentTopDomPx < domHeightPx - 5) {
      const remainingDomHeight = domHeightPx - currentTopDomPx;

      if (remainingDomHeight <= maxPageDomHeightPx + 5) {
        // Last page slice fits within standard A4
        pageSlices.push({
          topDomPx: currentTopDomPx,
          bottomDomPx: domHeightPx,
          heightDomPx: remainingDomHeight
        });
        break;
      }

      // Propose ideal A4 cutoff
      const idealCutDomPx = currentTopDomPx + maxPageDomHeightPx;

      // Find if any logical item crosses the cut boundary
      let bestCutDomPx = idealCutDomPx;
      const intersectingItem = breakCandidates.find(item => 
        item.topPx < (idealCutDomPx - 15) && 
        item.bottomPx > (idealCutDomPx - 5)
      );

      if (intersectingItem && intersectingItem.topPx > (currentTopDomPx + 100)) {
        // Safe item break point found: break before this item
        bestCutDomPx = intersectingItem.topPx;
      }

      const sliceHeight = bestCutDomPx - currentTopDomPx;
      pageSlices.push({
        topDomPx: currentTopDomPx,
        bottomDomPx: bestCutDomPx,
        heightDomPx: sliceHeight
      });

      currentTopDomPx = bestCutDomPx;
    }

    // 7. Render each slice onto its corresponding A4 PDF page
    const pxScale = canvas.width / domWidthPx;

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
      pageCanvas.height = sliceHeightCanvasPx;
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

      pdf.addImage(sliceImgData, 'PNG', 0, 0, a4WidthMm, Math.min(renderedHeightMm, a4HeightMm), undefined, 'FAST');

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
    return true;
  } finally {
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
