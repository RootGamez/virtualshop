import { useEffect, useState } from 'react';
import type { LandingConfig } from '@jaw/shared';
import { useLanding } from '../hooks/useCmsData';
import { useMutation } from '../hooks/useMutation';
import { api } from '../lib/api';
import { toastSuccess } from '../store/toastStore';
import { TextField, TextAreaField } from '../components/ui/FormField';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';

interface HeroContent {
  title: string;
  subtitle: string;
  ctaLabel: string;
}
interface AboutContent {
  title: string;
  body: string;
}
interface SocialContent {
  instagram: string;
  tiktok: string;
  facebook: string;
}

/**
 * Formularios estructurados por sección conocida (hero/about/social) en vez de
 * un textarea de JSON crudo: más usable, y el shape queda validado por
 * construcción antes de mandarlo a PATCH /landing/:sectionKey (spec §5, §12).
 */
export function LandingEditorPage() {
  const { data: sections, loading, error, refetch } = useLanding();

  const hero = sections?.find((s) => s.sectionKey === 'hero');
  const about = sections?.find((s) => s.sectionKey === 'about');
  const social = sections?.find((s) => s.sectionKey === 'social');

  if (loading) return <Skeleton className="h-96 w-full max-w-2xl" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10">
      <h1 className="text-xl font-bold text-text">Landing</h1>
      <HeroForm section={hero} onSaved={refetch} />
      <AboutForm section={about} onSaved={refetch} />
      <SocialForm section={social} onSaved={refetch} />
    </div>
  );
}

function HeroForm({ section, onSaved }: { section?: LandingConfig; onSaved: () => void }) {
  const initial = (section?.content as Partial<HeroContent>) ?? {};
  const [title, setTitle] = useState(initial.title ?? '');
  const [subtitle, setSubtitle] = useState(initial.subtitle ?? '');
  const [ctaLabel, setCtaLabel] = useState(initial.ctaLabel ?? '');
  useEffect(() => {
    setTitle(initial.title ?? '');
    setSubtitle(initial.subtitle ?? '');
    setCtaLabel(initial.ctaLabel ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  const { mutate, loading } = useMutation((content: HeroContent) =>
    api.patch('/landing/hero', { content }),
  );

  return (
    <section>
      <h2 className="text-sm font-semibold text-text">Hero</h2>
      <div className="mt-3 flex flex-col gap-3">
        <TextField label="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextField label="Subtítulo" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        <TextField label="Texto del botón" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} />
        <Button
          type="button"
          loading={loading}
          className="self-start"
          onClick={async () => {
            const result = await mutate({ title, subtitle, ctaLabel });
            if (result !== undefined) {
              toastSuccess('Hero actualizado');
              onSaved();
            }
          }}
        >
          Guardar hero
        </Button>
      </div>
    </section>
  );
}

function AboutForm({ section, onSaved }: { section?: LandingConfig; onSaved: () => void }) {
  const initial = (section?.content as Partial<AboutContent>) ?? {};
  const [title, setTitle] = useState(initial.title ?? '');
  const [body, setBody] = useState(initial.body ?? '');
  useEffect(() => {
    setTitle(initial.title ?? '');
    setBody(initial.body ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  const { mutate, loading } = useMutation((content: AboutContent) =>
    api.patch('/landing/about', { content }),
  );

  return (
    <section>
      <h2 className="text-sm font-semibold text-text">Sobre nosotros</h2>
      <div className="mt-3 flex flex-col gap-3">
        <TextField label="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextAreaField label="Texto" value={body} onChange={(e) => setBody(e.target.value)} />
        <Button
          type="button"
          loading={loading}
          className="self-start"
          onClick={async () => {
            const result = await mutate({ title, body });
            if (result !== undefined) {
              toastSuccess('Sección actualizada');
              onSaved();
            }
          }}
        >
          Guardar sección
        </Button>
      </div>
    </section>
  );
}

function SocialForm({ section, onSaved }: { section?: LandingConfig; onSaved: () => void }) {
  const initial = (section?.content as Partial<SocialContent>) ?? {};
  const [instagram, setInstagram] = useState(initial.instagram ?? '');
  const [tiktok, setTiktok] = useState(initial.tiktok ?? '');
  const [facebook, setFacebook] = useState(initial.facebook ?? '');
  useEffect(() => {
    setInstagram(initial.instagram ?? '');
    setTiktok(initial.tiktok ?? '');
    setFacebook(initial.facebook ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  const { mutate, loading } = useMutation((content: SocialContent) =>
    api.patch('/landing/social', { content }),
  );

  return (
    <section>
      <h2 className="text-sm font-semibold text-text">Redes sociales</h2>
      <div className="mt-3 flex flex-col gap-3">
        <TextField label="Instagram (URL)" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
        <TextField label="TikTok (URL)" value={tiktok} onChange={(e) => setTiktok(e.target.value)} />
        <TextField label="Facebook (URL)" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
        <Button
          type="button"
          loading={loading}
          className="self-start"
          onClick={async () => {
            const result = await mutate({ instagram, tiktok, facebook });
            if (result !== undefined) {
              toastSuccess('Redes actualizadas');
              onSaved();
            }
          }}
        >
          Guardar redes
        </Button>
      </div>
    </section>
  );
}
