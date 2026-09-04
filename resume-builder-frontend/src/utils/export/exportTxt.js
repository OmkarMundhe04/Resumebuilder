import { extractRawResumeText } from '../canonicalResume';

export const exportToTxt = (resume, filename = 'Resume.txt') => {
  if (!resume) throw new Error('Resume data is required');

  const textContent = extractRawResumeText(resume);
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};
