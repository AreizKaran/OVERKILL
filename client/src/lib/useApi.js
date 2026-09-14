import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api.js';

/**
 * Fetches a portal endpoint with loading/error state and a manual `reload`.
 * Requests are dropped if the component unmounts or the path changes.
 */
export function useApi(path, { enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const latest = useRef(0);

  const load = useCallback(async () => {
    if (!enabled || !path) return;
    const requestId = latest.current + 1;
    latest.current = requestId;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(path);
      if (latest.current !== requestId) return;
      setData(response.data);
      setMeta(response.meta ?? null);
    } catch (err) {
      if (latest.current !== requestId) return;
      setError(err);
    } finally {
      if (latest.current === requestId) setLoading(false);
    }
  }, [path, enabled]);

  useEffect(() => {
    load();
    return () => {
      latest.current += 1; // invalidate any in-flight response
    };
  }, [load]);

  return { data, meta, error, loading, reload: load, setData };
}
