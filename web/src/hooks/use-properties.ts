import { useEffect } from 'react';
import { usePropertyStore } from '@/stores/property.store';

export function useProperties() {
  const store = usePropertyStore();

  useEffect(() => {
    store.fetchMyProperties();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return store;
}
