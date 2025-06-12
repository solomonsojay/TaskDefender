import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders onboarding flow for new users', () => {
    render(<App />);
    expect(screen.getByText('Welcome to Task Defender')).toBeInTheDocument();
  });
});