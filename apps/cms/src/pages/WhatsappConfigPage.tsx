import { useEffect, useState } from 'react';
import { useWhatsappConfig } from '../hooks/useCmsData';
import { useMutation } from '../hooks/useMutation';
import { api } from '../lib/api';
import { toastSuccess } from '../store/toastStore';
import { TextField, TextAreaField } from '../components/ui/FormField';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';

export function WhatsappConfigPage() {
  const { data: config, loading, error, refetch } = useWhatsappConfig();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('');

  useEffect(() => {
    if (config) {
      setPhoneNumber(config.phoneNumber);
      setMessageTemplate(config.messageTemplate);
    }
  }, [config]);

  const { mutate, loading: saving } = useMutation(() =>
    api.patch('/whatsapp', { phoneNumber, messageTemplate }),
  );

  if (loading) return <Skeleton className="h-64 w-full max-w-xl" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-xl font-bold text-text">Configuración de WhatsApp</h1>
      <p className="mt-1 text-sm text-text-muted">
        Número y plantilla del mensaje de pedido (spec §9). Placeholders disponibles:{' '}
        <code>[nombre]</code>, <code>[precio]</code>, <code>[link]</code>.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <TextField
          label="Número (con código de país, sin +)"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="5215500000000"
        />
        <TextAreaField
          label="Plantilla del mensaje"
          value={messageTemplate}
          onChange={(e) => setMessageTemplate(e.target.value)}
          rows={3}
        />
        <Button
          type="button"
          loading={saving}
          className="self-start"
          onClick={async () => {
            const result = await mutate();
            if (result !== undefined) {
              toastSuccess('Configuración guardada');
              refetch();
            }
          }}
        >
          Guardar
        </Button>
      </div>
    </div>
  );
}
