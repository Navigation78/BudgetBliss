import { useState, useEffect, useCallback } from 'react';

// Very small fetch hook that returns { data, loading, error, refetch }
export default function useFetch(url, options = {}, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(url));
  const [error, setError] = useState(null);

  const fetcher = useCallback(async (signal) => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, { ...options, signal });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText || 'Fetch error');
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      if (err.name !== 'AbortError') setError(err);
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(options)]);

  useEffect(() => {
    const controller = new AbortController();
    fetcher(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps.concat([fetcher]));

  return { data, loading, error, refetch: fetcher };
}
