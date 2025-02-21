import { useEffect, useState } from "react";

const useStoredState = <T>(key: string, defaultValue: T) => {
  const [state, setState] = useState<T>(() => {
    const storedState = localStorage.getItem(key);
    return storedState ? (JSON.parse(storedState) as T) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
};

export default useStoredState;
