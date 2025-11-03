const API_BASE_URL = '/api';

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

export const api = {
  newsletters: {
    getAll: () => fetchAPI('/newsletters'),
    getById: (id: string) => fetchAPI(`/newsletters/${id}`),
    triggerProcess: () => fetchAPI('/newsletters/process', { method: 'POST' }),
    reprocess: (id: string) => fetchAPI(`/newsletters/${id}/reprocess`, { method: 'POST' }),
  },
  summaries: {
    getAll: () => fetchAPI('/summaries'),
    getById: (id: string) => fetchAPI(`/summaries/${id}`),
    updateExportStatus: (id: string, exported: boolean) =>
      fetchAPI(`/summaries/${id}/export`, {
        method: 'PATCH',
        body: JSON.stringify({ exported }),
      }),
  },
  aggregated: {
    getAll: () => fetchAPI('/summaries/aggregated/all'),
    getById: (id: string) => fetchAPI(`/summaries/aggregated/${id}`),
  },
  config: {
    getAll: () => fetchAPI('/config'),
    update: (key: string, value: any) =>
      fetchAPI(`/config/${key}`, {
        method: 'PATCH',
        body: JSON.stringify({ value }),
      }),
  },
  logs: {
    getAll: (limit?: number, type?: string) => {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (type) params.append('type', type);
      return fetchAPI(`/logs?${params.toString()}`);
    },
    getStats: () => fetchAPI('/logs/stats'),
  },
};
