import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import BlocklistManagerPage from '../pages/BlocklistManagerPage';
import { createWrapper } from './test-utils';

describe('BlocklistManagerPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockReset();
    vi.unstubAllGlobals();
  });

  it('submits a new blocklist entry', async () => {
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;

    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ items: [] }) })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ id: '1', url: 'https://bad.example', createdAt: new Date().toISOString() })
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ items: [] }) });

    render(createWrapper(<BlocklistManagerPage />));

    await waitFor(() => expect(screen.getByText(/block list/i)).toBeInTheDocument());

    const urlInput = screen.getByLabelText(/url/i);
    fireEvent.change(urlInput, { target: { value: 'https://bad.example' } });

    fireEvent.click(screen.getByRole('button', { name: /add entry/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/lists/block',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
