/**
 * Smart Resume Pagination & One-Page PDF Layout Engine
 * 
 * Production-grade intelligent layout optimizer:
 * - One-page default optimization target for undergraduate/early-career resumes
 * - Safe typography bounds (Body font >= 10pt / 13.3px, never lower)
 * - Safe physical page margins (0.5in - 0.75in / 48px - 72px)
 * - Non-destructive progressive micro-spacing, gap, and line-height optimization
 * - Strict orphan heading prevention (headings never isolated at bottom of page)
 * - Breakable section items (Project A & B on Page 1, Project C on Page 2)
 * - Graceful multi-page fallback for dense professional resumes
 * - Pure DOM isolation & reliable style restoration
 */

export const A4_CONSTANTS = {
  WIDTH_MM: 210,
  HEIGHT_MM: 297,
  ASPECT_RATIO: 297 / 210, // ~1.4142857
  DPI_96: 96,
  MM_TO_PX: 96 / 25.4, // ~3.779527559
  STANDARD_WIDTH_PX: 794,
  STANDARD_HEIGHT_PX: 1123, // 794 * 1.4142857 ≈ 1122.94px
  MIN_PAGE_MARGIN_PX: 48, // Strict 0.5 inch minimum physical page margin
  MAX_PAGE_MARGIN_PX: 72, // 0.75 inch maximum physical page margin
  MIN_BODY_FONT_SIZE_PT: 10.0, // Strict professional readability minimum (10pt = 13.33px)
  MAX_BODY_FONT_SIZE_PT: 12.0
};

export const DENSITY_PROFILES = {
  comfortable: {
    name: 'comfortable',
    pagePaddingTop: '48px',
    pagePaddingBottom: '48px',
    pagePaddingX: '48px',
    sectionGap: '14px',
    headerGap: '16px',
    itemGap: '8px',
    headingGap: '6px',
    bulletGap: '3px',
    lineHeight: '1.45',
    bodyFontSize: '10.5pt',
    h1FontSize: '20pt',
    h2FontSize: '11pt',
    metaFontSize: '9pt'
  },
  compact: {
    name: 'compact',
    pagePaddingTop: '48px',
    pagePaddingBottom: '48px',
    pagePaddingX: '48px',
    sectionGap: '10px',
    headerGap: '12px',
    itemGap: '6px',
    headingGap: '4px',
    bulletGap: '2px',
    lineHeight: '1.38',
    bodyFontSize: '10.25pt',
    h1FontSize: '19pt',
    h2FontSize: '10.5pt',
    metaFontSize: '8.5pt'
  },
  dense: {
    name: 'dense',
    pagePaddingTop: '48px',
    pagePaddingBottom: '48px',
    pagePaddingX: '48px',
    sectionGap: '8px',
    headerGap: '10px',
    itemGap: '4px',
    headingGap: '3px',
    bulletGap: '1.5px',
    lineHeight: '1.34',
    bodyFontSize: '10.0pt', // Strictly >= 10pt
    h1FontSize: '18pt',
    h2FontSize: '10pt',
    metaFontSize: '8.25pt'
  }
};

/**
 * Apply a density profile to a resume DOM element using CSS variables.
 * Returns a restore function that resets the element's styles.
 */
export const applyDensityProfile = (element, profileName = 'comfortable') => {
  if (!element || !element.style) return () => {};

  const profile = DENSITY_PROFILES[profileName] || DENSITY_PROFILES.comfortable;
  
  // Cache original inline style values for safe restoration
  const originalVars = {
    '--resume-page-padding-top': element.style.getPropertyValue('--resume-page-padding-top'),
    '--resume-page-padding-bottom': element.style.getPropertyValue('--resume-page-padding-bottom'),
    '--resume-page-padding-x': element.style.getPropertyValue('--resume-page-padding-x'),
    '--resume-section-gap': element.style.getPropertyValue('--resume-section-gap'),
    '--resume-header-gap': element.style.getPropertyValue('--resume-header-gap'),
    '--resume-item-gap': element.style.getPropertyValue('--resume-item-gap'),
    '--resume-heading-gap': element.style.getPropertyValue('--resume-heading-gap'),
    '--resume-bullet-gap': element.style.getPropertyValue('--resume-bullet-gap'),
    '--resume-line-height': element.style.getPropertyValue('--resume-line-height'),
    '--resume-body-font-size': element.style.getPropertyValue('--resume-body-font-size'),
    '--resume-h1-font-size': element.style.getPropertyValue('--resume-h1-font-size'),
    '--resume-h2-font-size': element.style.getPropertyValue('--resume-h2-font-size'),
    '--resume-meta-font-size': element.style.getPropertyValue('--resume-meta-font-size')
  };

  const originalPadding = element.style.padding;
  const originalLineHeight = element.style.lineHeight;
  const originalFontSize = element.style.fontSize;

  // Apply CSS custom properties
  element.style.setProperty('--resume-page-padding-top', profile.pagePaddingTop);
  element.style.setProperty('--resume-page-padding-bottom', profile.pagePaddingBottom);
  element.style.setProperty('--resume-page-padding-x', profile.pagePaddingX);
  element.style.setProperty('--resume-section-gap', profile.sectionGap);
  element.style.setProperty('--resume-header-gap', profile.headerGap);
  element.style.setProperty('--resume-item-gap', profile.itemGap);
  element.style.setProperty('--resume-heading-gap', profile.headingGap);
  element.style.setProperty('--resume-bullet-gap', profile.bulletGap);
  element.style.setProperty('--resume-line-height', profile.lineHeight);
  element.style.setProperty('--resume-body-font-size', profile.bodyFontSize);
  element.style.setProperty('--resume-h1-font-size', profile.h1FontSize);
  element.style.setProperty('--resume-h2-font-size', profile.h2FontSize);
  element.style.setProperty('--resume-meta-font-size', profile.metaFontSize);

  // Directly set padding and font variables for elements without CSS var support
  element.style.padding = `${profile.pagePaddingTop} ${profile.pagePaddingX} ${profile.pagePaddingBottom}`;
  element.style.lineHeight = profile.lineHeight;
  element.style.fontSize = profile.bodyFontSize;

  // Update inner section and item margins directly to guarantee instant layout sync
  const sections = Array.from(element.querySelectorAll('.resume-section, section, [data-section]')).filter(
    s => s.tagName.toLowerCase() !== 'header' && s.getAttribute('data-section') !== 'personal'
  );
  const items = Array.from(element.querySelectorAll(
    '.experience-item, .project-item, .education-item, .certification-item, .publication-item, .award-item, .volunteer-item'
  ));
  const headers = Array.from(element.querySelectorAll('header[data-section="personal"], .resume-header'));
  const headings = Array.from(element.querySelectorAll('h2'));
  const bullets = Array.from(element.querySelectorAll('li'));

  const originalSectionMargins = sections.map(s => s.style.marginBottom);
  const originalItemMargins = items.map(it => it.style.marginBottom);
  const originalHeaderMargins = headers.map(h => h.style.marginBottom);
  const originalHeadingMargins = headings.map(h => h.style.marginBottom);
  const originalBulletMargins = bullets.map(b => b.style.marginBottom);

  sections.forEach(s => { s.style.marginBottom = profile.sectionGap; });
  items.forEach(it => { it.style.marginBottom = profile.itemGap; });
  headers.forEach(h => { h.style.marginBottom = profile.headerGap; });
  headings.forEach(h => { h.style.marginBottom = profile.headingGap; });
  bullets.forEach(b => { b.style.marginBottom = profile.bulletGap; });

  // Return full restore function
  return () => {
    Object.entries(originalVars).forEach(([key, val]) => {
      if (val) {
        element.style.setProperty(key, val);
      } else {
        element.style.removeProperty(key);
      }
    });
    element.style.padding = originalPadding;
    element.style.lineHeight = originalLineHeight;
    element.style.fontSize = originalFontSize;

    sections.forEach((s, idx) => { s.style.marginBottom = originalSectionMargins[idx]; });
    items.forEach((it, idx) => { it.style.marginBottom = originalItemMargins[idx]; });
    headers.forEach((h, idx) => { h.style.marginBottom = originalHeaderMargins[idx]; });
    headings.forEach((h, idx) => { h.style.marginBottom = originalHeadingMargins[idx]; });
    bullets.forEach((b, idx) => { b.style.marginBottom = originalBulletMargins[idx]; });
  };
};

/**
 * Measure the exact rendered height of a resume element.
 */
export const measureElementHeight = (element) => {
  if (!element) return 0;
  const rect = element.getBoundingClientRect();
  return Math.max(Math.ceil(rect.height), element.scrollHeight || 0);
};

/**
 * Smart Layout Optimizer:
 * Automatically finds the optimal density profile for single-page presentation
 * or returns comfortable profile for naturally multi-page resumes.
 * 
 * Order of optimization:
 * 1. Comfortable (Standard)
 * 2. Compact (Micro-spacing & gap optimization)
 * 3. Dense (Safe typography & compact fitting)
 * 4. Multi-Page Fallback (Comfortable profile with clean pagination)
 */
export const optimizeResumeLayout = (element, maxPageHeightPx = A4_CONSTANTS.STANDARD_HEIGHT_PX) => {
  if (!element) {
    return {
      profile: 'comfortable',
      isSinglePage: true,
      measuredHeightPx: 0,
      targetHeightPx: maxPageHeightPx,
      restore: () => {}
    };
  }

  // 1. Try Comfortable Profile
  let restore = applyDensityProfile(element, 'comfortable');
  let height = measureElementHeight(element);

  if (height <= maxPageHeightPx) {
    return {
      profile: 'comfortable',
      isSinglePage: true,
      measuredHeightPx: height,
      targetHeightPx: maxPageHeightPx,
      restore
    };
  }

  // 2. Try Compact Profile
  restore();
  restore = applyDensityProfile(element, 'compact');
  height = measureElementHeight(element);

  if (height <= maxPageHeightPx) {
    return {
      profile: 'compact',
      isSinglePage: true,
      measuredHeightPx: height,
      targetHeightPx: maxPageHeightPx,
      restore
    };
  }

  // 3. Try Dense Profile (Safe 10pt minimum body text)
  restore();
  restore = applyDensityProfile(element, 'dense');
  height = measureElementHeight(element);

  if (height <= maxPageHeightPx) {
    return {
      profile: 'dense',
      isSinglePage: true,
      measuredHeightPx: height,
      targetHeightPx: maxPageHeightPx,
      restore
    };
  }

  // 4. Content genuinely requires multiple pages
  // Check if 2-page comfortable or 2-page compact is optimal
  const maxTwoPageHeight = maxPageHeightPx * 2;
  restore();
  
  // Use comfortable for multi-page unless compact fits 2 pages cleanly
  restore = applyDensityProfile(element, 'comfortable');
  height = measureElementHeight(element);

  if (height > maxTwoPageHeight) {
    // Try compact for 2-page fit if comfortable exceeds 2 pages
    restore();
    restore = applyDensityProfile(element, 'compact');
    height = measureElementHeight(element);
    if (height <= maxTwoPageHeight) {
      return {
        profile: 'compact',
        isSinglePage: false,
        estimatedPages: 2,
        measuredHeightPx: height,
        targetHeightPx: maxPageHeightPx,
        restore
      };
    }
    // Otherwise return comfortable
    restore();
    restore = applyDensityProfile(element, 'comfortable');
    height = measureElementHeight(element);
  }

  return {
    profile: 'comfortable',
    isSinglePage: false,
    estimatedPages: Math.ceil(height / maxPageHeightPx),
    measuredHeightPx: height,
    targetHeightPx: maxPageHeightPx,
    restore
  };
};

/**
 * Calculate Intelligent Page Slices with Strict Orphan Heading Protection
 * and Breakable Item-Level Support.
 * 
 * Rules:
 * 1. High Priority Breaks: Between items (.project-item, .experience-item, .education-item, etc.)
 * 2. Medium Priority Breaks: Between list bullets (li) when an individual item spans across page boundary
 * 3. Lower Priority Breaks: Between full sections
 * 4. FORBIDDEN: Isolating an h2/h3 heading at the bottom of a page without at least its first item.
 *    If an h2 fits on Page 1 but its first item starts on Page 2, the cut MUST occur before the h2!
 */
export const calculateSmartPageSlices = (element, maxPageHeightPx = A4_CONSTANTS.STANDARD_HEIGHT_PX) => {
  if (!element) return [];

  const elemRect = element.getBoundingClientRect();
  const domHeightPx = Math.max(element.scrollHeight, Math.ceil(elemRect.height));

  // Single page fit check
  if (domHeightPx <= maxPageHeightPx + 4) {
    return [{
      topDomPx: 0,
      bottomDomPx: domHeightPx,
      heightDomPx: domHeightPx,
      pageNumber: 1,
      isLastPage: true
    }];
  }

  // 1. Gather all sections and their sub-items
  const sectionNodes = Array.from(element.querySelectorAll('section.resume-section, section, [data-section]')).filter(
    s => s.getAttribute('data-section') !== 'personal' && s.tagName.toLowerCase() !== 'header'
  );

  const sections = sectionNodes.map(secNode => {
    const sRect = secNode.getBoundingClientRect();
    const heading = secNode.querySelector('h2, h3');
    const hRect = heading ? heading.getBoundingClientRect() : null;
    
    const itemNodes = Array.from(secNode.querySelectorAll(
      '.experience-item, .project-item, .education-item, .certification-item, .publication-item, .award-item, .volunteer-item, .custom-item, .skills-section, [data-section="skills"]'
    ));

    const items = itemNodes.map(itNode => {
      const itRect = itNode.getBoundingClientRect();
      const bulletNodes = Array.from(itNode.querySelectorAll('li'));
      const bullets = bulletNodes.map(bNode => {
        const bRect = bNode.getBoundingClientRect();
        return {
          topPx: bRect.top - elemRect.top,
          bottomPx: bRect.bottom - elemRect.top,
          heightPx: bRect.height
        };
      }).filter(b => b.heightPx > 0);

      return {
        topPx: itRect.top - elemRect.top,
        bottomPx: itRect.bottom - elemRect.top,
        heightPx: itRect.height,
        bullets
      };
    }).filter(it => it.heightPx > 0);

    return {
      topPx: sRect.top - elemRect.top,
      bottomPx: sRect.bottom - elemRect.top,
      heightPx: sRect.height,
      headingTopPx: hRect ? hRect.top - elemRect.top : (sRect.top - elemRect.top),
      headingBottomPx: hRect ? hRect.bottom - elemRect.top : (sRect.top - elemRect.top + 24),
      items
    };
  }).filter(s => s.heightPx > 0);

  // 2. Build candidate cut points with semantic classification and priorities
  // Priority 1: Item boundaries (top of each item)
  // Priority 2: Bullet boundaries (top of each bullet)
  // Priority 3: Section boundaries (top of section)
  const cutCandidates = [];

  sections.forEach(sec => {
    // Cut before section is allowed ONLY if the entire section moves
    cutCandidates.push({
      topPx: sec.topPx,
      type: 'section-start',
      priority: 3,
      sectionRef: sec
    });

    sec.items.forEach((item, itIdx) => {
      // If this is the FIRST item in the section, cutting before it means cutting before the section heading!
      // (Orphan Protection: heading + first item must stay together)
      const isFirstItem = (itIdx === 0);
      const effectiveCutPx = isFirstItem ? sec.topPx : item.topPx;

      cutCandidates.push({
        topPx: effectiveCutPx,
        type: isFirstItem ? 'section-start-with-heading' : 'item-start',
        priority: 1,
        itemRef: item,
        sectionRef: sec
      });

      // Bullets within long items
      item.bullets.forEach((bullet, bIdx) => {
        if (bIdx > 0) { // Don't cut before first bullet alone
          cutCandidates.push({
            topPx: bullet.topPx,
            type: 'bullet-start',
            priority: 2,
            bulletRef: bullet,
            itemRef: item
          });
        }
      });
    });
  });

  // Deduplicate and sort cut candidates by ascending topPx
  const uniqueCuts = [];
  const seenTopPx = new Set();

  cutCandidates.sort((a, b) => a.topPx - b.topPx).forEach(c => {
    const rounded = Math.round(c.topPx);
    if (!seenTopPx.has(rounded) && rounded > 0 && rounded < domHeightPx) {
      seenTopPx.add(rounded);
      uniqueCuts.push({ ...c, topPx: rounded });
    }
  });

  // 3. Compute optimal page slices
  const slices = [];
  let currentTopPx = 0;
  let pageNumber = 1;

  while (currentTopPx < domHeightPx - 5) {
    const remainingHeight = domHeightPx - currentTopPx;

    if (remainingHeight <= maxPageHeightPx + 5) {
      slices.push({
        topDomPx: currentTopPx,
        bottomDomPx: domHeightPx,
        heightDomPx: remainingHeight,
        pageNumber,
        isLastPage: true
      });
      break;
    }

    const idealCutPx = currentTopPx + maxPageHeightPx;

    // Search window for safe cut: [idealCut - 35% of page height, idealCut]
    const minSafeCutPx = currentTopPx + (maxPageHeightPx * 0.65);

    // Filter candidate cuts that fall within the safe window
    const validCandidates = uniqueCuts.filter(
      c => c.topPx >= minSafeCutPx && c.topPx <= (idealCutPx - 5)
    );

    let bestCutPx = idealCutPx;

    if (validCandidates.length > 0) {
      // Choose the highest priority candidate nearest to idealCutPx
      // Priority 1 (Item breaks) > Priority 2 (Bullet breaks) > Priority 3 (Section breaks)
      validCandidates.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority; // Lower number = Higher priority (1 before 2 before 3)
        }
        return b.topPx - a.topPx; // Closer to idealCutPx is better
      });

      bestCutPx = validCandidates[0].topPx;
    } else {
      // Fallback: look for ANY candidate before idealCutPx if available
      const anyCandidate = uniqueCuts.filter(
        c => c.topPx > (currentTopPx + 150) && c.topPx <= idealCutPx
      );
      if (anyCandidate.length > 0) {
        bestCutPx = anyCandidate[anyCandidate.length - 1].topPx;
      }
    }

    // Safety check: ensure cut makes forward progress
    if (bestCutPx <= currentTopPx + 50) {
      bestCutPx = Math.min(idealCutPx, domHeightPx);
    }

    const sliceHeight = bestCutPx - currentTopPx;
    slices.push({
      topDomPx: currentTopPx,
      bottomDomPx: bestCutPx,
      heightDomPx: sliceHeight,
      pageNumber,
      isLastPage: false
    });

    currentTopPx = bestCutPx;
    pageNumber++;
  }

  return slices;
};
