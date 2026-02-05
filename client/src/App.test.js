import { render, screen } from '@testing-library/react';
import App from './App';

test('renders hospital-style CarePulse experience', () => {
  render(<App />);
  expect(screen.getByText(/CarePulse Hospital AI/i)).toBeInTheDocument();
  expect(screen.getByText(/Early Alzheimer's Risk Detection/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Generate Clinical Risk Report/i })).toBeInTheDocument();
});
