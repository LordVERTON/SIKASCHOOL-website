'use client';

import { useEffect, useState } from 'react';
import Alert from '@/components/Common/Alert';
import Button from '@/components/Common/Button';

export default function DatabaseHealth() {
  const [version, setVersion] = useState(0);
  const [status, setStatus] = useState<'loading' | 'up' | 'unavailable'>('loading');
  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    void fetch('/api/admin/health', { cache: 'no-store', signal: AbortSignal.any([controller.signal, AbortSignal.timeout(12000)]) })
      .then(async response => {
        const data = await response.json();
        if (!response.ok || data.database !== 'up') throw new Error('Unavailable');
        if (!controller.signal.aborted) setStatus('up');
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus('unavailable');
      });
    return () => controller.abort();
  }, [version]);
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3" aria-busy={status === 'loading'}>
      <Alert tone={status === 'up' ? 'success' : status === 'loading' ? 'info' : 'error'} className="flex-1">
        {status === 'loading' ? 'Vérification de la connexion à la base…'
          : status === 'up' ? 'Base de données accessible.'
            : 'La connexion à la base n’a pas pu être vérifiée. Réessayez avant de modifier des données.'}
      </Alert>
      <Button variant="secondary" disabled={status === 'loading'} onClick={() => setVersion(value => value + 1)}>
        Vérifier à nouveau
      </Button>
    </div>
  );
}
