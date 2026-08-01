import { useState, useEffect, useCallback, useRef } from 'react';
import { apiGet } from '../utils/apiClient';

// Small fetch hook wired to the backend API client (base URL + auth header).
export default function useFetch(path, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const fetcher = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      const json = await apiGet(path);
      if (mountedRef.current) setData(json);
    } catch (err) {
      if (mountedRef.current) setError(err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    mountedRef.current = true;
    fetcher();
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps.concat([fetcher]));

  return { data, loading, error, refetch: fetcher };
}
