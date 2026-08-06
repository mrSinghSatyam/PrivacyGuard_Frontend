import { useEffect, useState } from "react";

export default function useFetch(apiFn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    apiFn()
      .then((res) => mounted && setData(res.data))
      .catch((err) => mounted && setError(err))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [apiFn]);

  return { data, loading, error };
}
