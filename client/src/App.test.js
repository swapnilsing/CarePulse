import { render, screen } from '@testing-library/react';
import App from './App';

test('renders CarePulse heading and form CTA', () => {
  render(<App />);
  expect(screen.getByText(/AI-Powered Early Detection/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Analyze & Predict/i })).toBeInTheDocument();
});
