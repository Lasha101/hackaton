import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { listMaterials, type DocumentSummary } from '@/api/materials';

export type MaterialKind = 'pdf' | 'docx' | 'txt' | 'other';

export type Material = {
  id: string;
  name: string;
  kind: MaterialKind;
  size: number;
  uploadedAt: number;
  cardCount: number;
  /** Sections the backend splits the file into; each becomes one lesson. */
  totalSections: number;
  /** Sections whose lessons are generated (or skipped as front/back matter). */
  readySections: number;
  answered: number;
  /** Still generating lessons in the background. */
  processing: boolean;
};

type MaterialsContextValue = {
  materials: Material[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addMaterial: (material: Material) => void;
};

/** How often to re-fetch while a file is still being turned into lessons. */
const POLL_MS = 3000;

function toMaterial(doc: DocumentSummary): Material {
  return {
    id: doc.doc_id,
    name: doc.filename,
    kind: kindFromFile(doc.filename),
    size: doc.size_bytes,
    uploadedAt: Date.parse(doc.created_at),
    cardCount: doc.card_count,
    totalSections: doc.total_sections,
    readySections: doc.ready,
    answered: doc.answered,
    processing: doc.ready + doc.failed < doc.total_sections,
  };
}

const MaterialsContext = createContext<MaterialsContextValue | null>(null);

export function MaterialsProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setMaterials((await listMaterials()).map(toMaterial));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your library.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const anyProcessing = materials.some((material) => material.processing);
  useEffect(() => {
    if (!anyProcessing) return;
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [anyProcessing, refresh]);

  const addMaterial = (material: Material) =>
    setMaterials((current) => [material, ...current.filter((item) => item.id !== material.id)]);

  return (
    <MaterialsContext.Provider value={{ materials, loading, error, refresh, addMaterial }}>
      {children}
    </MaterialsContext.Provider>
  );
}

export function useMaterials() {
  const context = useContext(MaterialsContext);
  if (!context) {
    throw new Error('useMaterials must be used within a MaterialsProvider');
  }
  return context;
}

export function kindFromFile(name: string, mimeType?: string): MaterialKind {
  const extension = name.split('.').pop()?.toLowerCase();
  if (extension === 'pdf' || mimeType === 'application/pdf') return 'pdf';
  if (extension === 'docx' || mimeType?.includes('word')) return 'docx';
  if (extension === 'txt' || extension === 'md' || mimeType?.startsWith('text/')) return 'txt';
  return 'other';
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
