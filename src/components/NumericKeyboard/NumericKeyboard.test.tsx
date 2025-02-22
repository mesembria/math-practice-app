import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NumericKeyboard from './NumericKeyboard';

describe('NumericKeyboard', () => {
  const mockOnChange = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnSubmit.mockClear();
  });

  it('renders all number buttons and backspace', () => {
    render(<NumericKeyboard value="" onChange={mockOnChange} />);
    
    // Check all numbers are present
    for (let i = 0; i < 10; i++) {
      expect(screen.getByRole('spinbutton', { name: `Number ${i}` })).toBeInTheDocument();
    }
    
    // Check backspace button
    expect(screen.getByRole('button', { name: 'Backspace' })).toBeInTheDocument();
  });

  it('handles number button clicks correctly', async () => {
    render(<NumericKeyboard value="1" onChange={mockOnChange} />);
    
    const button2 = screen.getByRole('spinbutton', { name: 'Number 2' });
    await userEvent.click(button2);
    
    expect(mockOnChange).toHaveBeenCalledWith('12');
  });

  it('handles backspace button click correctly', async () => {
    render(<NumericKeyboard value="123" onChange={mockOnChange} />);
    
    const backspaceButton = screen.getByRole('button', { name: 'Backspace' });
    await userEvent.click(backspaceButton);
    
    expect(mockOnChange).toHaveBeenCalledWith('12');
  });

  it('respects maxLength prop', async () => {
    render(<NumericKeyboard value="12" onChange={mockOnChange} maxLength={2} />);
    
    const button3 = screen.getByRole('spinbutton', { name: 'Number 3' });
    await userEvent.click(button3);
    
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('prevents leading zeros', async () => {
    render(<NumericKeyboard value="0" onChange={mockOnChange} />);
    
    const button0 = screen.getByRole('spinbutton', { name: 'Number 0' });
    await userEvent.click(button0);
    
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('replaces zero when entering first digit', async () => {
    render(<NumericKeyboard value="0" onChange={mockOnChange} />);
    
    const button1 = screen.getByRole('spinbutton', { name: 'Number 1' });
    await userEvent.click(button1);
    
    expect(mockOnChange).toHaveBeenCalledWith('1');
  });

  it('handles keyboard input correctly', async () => {
    const { rerender } = render(<NumericKeyboard value="1" onChange={mockOnChange} />);
    
    await userEvent.type(document.body, '2');
    expect(mockOnChange).toHaveBeenCalledWith('12');
    
    // Simulate parent updating value
    rerender(<NumericKeyboard value="12" onChange={mockOnChange} />);
    
    await userEvent.type(document.body, '{Backspace}');
    expect(mockOnChange).toHaveBeenCalledWith('1');
  });

  it('calls onSubmit when Enter key is pressed', async () => {
    render(
      <NumericKeyboard
        value="123"
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    );
    
    await userEvent.type(document.body, '{Enter}');
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('handles rapid inputs correctly', async () => {
    const { rerender } = render(<NumericKeyboard value="" onChange={mockOnChange} />);
    
    const button1 = screen.getByRole('spinbutton', { name: 'Number 1' });
    await userEvent.click(button1);
    
    // Simulate parent component updating value
    rerender(<NumericKeyboard value="1" onChange={mockOnChange} />);
    
    const button2 = screen.getByRole('spinbutton', { name: 'Number 2' });
    await userEvent.click(button2);
    
    expect(mockOnChange).toHaveBeenCalledWith('12');
  });

  it('applies custom className correctly', () => {
    const customClass = 'custom-class';
    render(
      <NumericKeyboard
        value=""
        onChange={mockOnChange}
        className={customClass}
      />
    );
    
    const keyboard = screen.getByRole('group');
    expect(keyboard.className).toContain(customClass);
  });
});
