import Constants from 'expo-constants';
import type { DocumentPickerAsset } from 'expo-document-picker';
import { Platform } from 'react-native';

const BACKEND_PORT = 8000;

/**
 * Backend address. Set `EXPO_PUBLIC_API_URL` to point at a deployed backend.
 * In development it defaults to the machine running the Expo dev server, so a
 * phone on the same Wi-Fi reaches the backend without any configuration.
 */
function resolveApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${devHost ?? 'localhost'}:${BACKEND_PORT}`;
}

export const API_BASE_URL = resolveApiUrl();

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

/** FastAPI puts a readable message in `detail` for the errors we raise. */
function errorFromBody(status: number, body: string): ApiError {
  let detail: string | undefined;
  try {
    const parsed = JSON.parse(body);
    if (typeof parsed?.detail === 'string') detail = parsed.detail;
  } catch {}
  return new ApiError(detail ?? `Request failed (${status})`, status);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init);
  } catch (error) {
    // Not every fetch failure is a network problem, so keep the underlying reason visible.
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`fetch ${path} failed:`, error);
    throw new ApiError(`Can’t reach the server at ${API_BASE_URL} (${reason}).`);
  }
  if (!response.ok) {
    throw errorFromBody(response.status, await response.text().catch(() => ''));
  }
  return response.json();
}

/**
 * POST multipart data with React Native's XMLHttpRequest.
 *
 * On native, the global fetch is expo/fetch, which can't send RN's { uri, name, type }
 * file parts, and reading the picked file through expo-file-system is refused in
 * Expo Go (its copy lives outside the project's scoped folders). RN's XHR streams
 * the file natively, so it works in Expo Go and in development builds.
 */
function xhrPost<T>(path: string, body: FormData): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}${path}`);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new ApiError('The server sent a response we couldn’t read.', xhr.status));
        }
      } else {
        reject(errorFromBody(xhr.status, xhr.responseText));
      }
    };
    xhr.onerror = () => reject(new ApiError(`Can’t reach the server at ${API_BASE_URL}. Check that it’s running.`));
    xhr.ontimeout = () => reject(new ApiError('The upload timed out. Try again.'));
    xhr.send(body);
  });
}

// --- Types mirror the backend's Pydantic models (app/models.py) ---

export type UploadResponse = { doc_id: string; total_sections: number };

export type DocumentSummary = {
  doc_id: string;
  filename: string;
  size_bytes: number;
  created_at: string;
  total_sections: number;
  ready: number;
  failed: number;
  card_count: number;
  answered: number;
};

export type DocumentStatus = {
  ready: number;
  total: number;
  skipped: number;
  failed: number;
  resume_section: number | null;
};

export type PublicCard = {
  text: string;
  question: string;
  options: string[];
  answered: boolean;
  selected_index: number | null;
};

export type Section = {
  index: number;
  total_sections: number;
  skip: boolean;
  title: string;
  cards: PublicCard[];
};

export type AnswerResult = {
  correct: boolean;
  correct_index: number;
  explanation: string;
  first_attempt: boolean;
};

export type MissedQuestion = {
  section_index: number;
  card_index: number;
  lesson_title: string;
  question: string;
  options: string[];
  selected_index: number;
  correct_index: number;
  explanation: string;
};

export type Results = {
  correct: number;
  answered: number;
  total_questions: number;
  score_percent: number;
  missed: MissedQuestion[];
};

// --- Endpoints ---

/** Sends a study file to the backend, which splits it into sections and starts generating cards. */
export async function uploadStudyMaterial(asset: DocumentPickerAsset): Promise<UploadResponse> {
  const body = new FormData();
  // The backend uses this for type detection and display; on native the picker's
  // cached copy can have a different name.
  body.append('filename', asset.name);
  if (Platform.OS === 'web' && asset.file) {
    body.append('file', asset.file, asset.name);
    return request('/documents', { method: 'POST', body });
  }
  // React Native's FormData accepts a { uri, name, type } descriptor for local files.
  body.append('file', {
    uri: asset.uri,
    name: asset.name,
    type: asset.mimeType ?? 'application/octet-stream',
  } as unknown as Blob);
  return xhrPost('/documents', body);
}

export function listMaterials(): Promise<DocumentSummary[]> {
  return request('/documents');
}

export function getStatus(docId: string): Promise<DocumentStatus> {
  return request(`/documents/${docId}/status`);
}

/** Generates the lesson on demand if it isn't ready yet, so this can take several seconds. */
export function getSection(docId: string, index: number): Promise<Section> {
  return request(`/documents/${docId}/sections/${index}`);
}

export function answerCard(docId: string, section: number, card: number, selectedIndex: number): Promise<AnswerResult> {
  return request(`/documents/${docId}/sections/${section}/cards/${card}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selected_index: selectedIndex }),
  });
}

export function getResults(docId: string): Promise<Results> {
  return request(`/documents/${docId}/results`);
}
