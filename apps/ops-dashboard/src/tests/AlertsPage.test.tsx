import { render, screen, waitFor } from '@testing-library/react';
import AlertsPage from '../pages/AlertsPage';
import { createWrapper } from './test-utils';

describe('AlertsPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders alert rows after fetching data', async () => {
    const mockResponse = {
      items: [
        {
          id: 'alert-123',
          url: 'https://malicious.example/phish',
          status: 'new',
          severity: 'high',
          detectedAt: new Date('2024-01-01T12:00:00Z').toISOString(),
          reporter: 'detector-bot',
          tags: ['brand:contoso']
        }
      ],
      total: 1
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    }));

    render(createWrapper(<AlertsPage />));

    await waitFor(() => expect(screen.getByText('alert-123')).toBeInTheDocument());
    expect(screen.getByText('detector-bot')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/alerts?page=1&pageSize=25', expect.anything());
  });
});
