import { describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { formatMoney, Pager, StatusPill } from './ui';

describe('admin ui helpers', () => {
  test('formatMoney shows Rwandan francs without decimals', () => {
    expect(formatMoney('12500')).toMatch(/12,500/);
    expect(formatMoney(null)).toMatch(/0/);
  });

  test('StatusPill prettifies the status text', () => {
    render(<StatusPill value="ready_for_pickup" />);
    expect(screen.getByText('ready for pickup')).toBeTruthy();
  });

  test('Pager hides itself for a single page and pages through results', () => {
    const onChange = vi.fn();
    const { container, rerender } = render(<Pager total={10} pageSize={50} offset={0} onChange={onChange} />);
    expect(container.textContent).toBe('');

    rerender(<Pager total={120} pageSize={50} offset={0} onChange={onChange} />);
    expect(screen.getByText(/Page 1 of 3/)).toBeTruthy();
    expect((screen.getByText('Previous') as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByText('Next'));
    expect(onChange).toHaveBeenCalledWith(50);
  });
});
