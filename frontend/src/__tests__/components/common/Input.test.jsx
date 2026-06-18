import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Input from '@/components/common/Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders placeholder text', () => {
    render(<Input placeholder="Enter your email" />);
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('shows error styling on input', () => {
    render(<Input error="Error text" label="Test" />);
    const input = screen.getByLabelText('Test');
    expect(input.className).toMatch(/red|error|border-red/i);
  });

  it('shows helper text when no error', () => {
    render(<Input helperText="Must be 8+ characters" />);
    expect(screen.getByText('Must be 8+ characters')).toBeInTheDocument();
  });

  it('hides helper text when error is present', () => {
    render(<Input helperText="Helper" error="Error!" />);
    expect(screen.queryByText('Helper')).not.toBeInTheDocument();
  });

  it('calls onChange when typing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input label="Name" onChange={onChange} />);
    const input = screen.getByLabelText('Name');
    await user.type(input, 'John');
    expect(onChange).toHaveBeenCalledTimes(4);
  });

  it('displays current value', () => {
    render(<Input value="Pre-filled" onChange={() => {}} />);
    expect(screen.getByDisplayValue('Pre-filled')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<Input type="password" label="Password" />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByRole('button');
    await user.click(toggleBtn);
    expect(input).toHaveAttribute('type', 'text');
  });

  it('applies disabled state', () => {
    render(<Input label="Disabled" disabled />);
    expect(screen.getByLabelText('Disabled')).toBeDisabled();
  });

  it('forwards ref', () => {
    const ref = { current: null };
    render(<Input ref={ref} label="Ref" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('renders icon when provided', () => {
    render(<Input icon={<span data-testid="input-icon">@</span>} label="Email" />);
    expect(screen.getByTestId('input-icon')).toBeInTheDocument();
  });
});
