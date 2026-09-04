import React from 'react';
import { render, screen } from '@testing-library/react';
import BrandLogo from './components/common/BrandLogo';

describe('ResumeBuilder Core Brand & Shell Tests', () => {
  test('renders platform brand logo with accessible alt text', () => {
    render(<BrandLogo size={32} showGlow={true} />);
    const logoImg = screen.getByAltText(/ResumeBuilder Logo/i);
    expect(logoImg).toBeInTheDocument();
  });
});
