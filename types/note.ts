export type NoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'orange';

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  color: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  color?: string;
  tags?: string[];
  isPinned?: boolean;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  color?: string;
  tags?: string[];
  isPinned?: boolean;
}

export interface DbStatus {
  connected: boolean;
  provider: string; // 'Supabase Cloud (PostgreSQL)'
  projectUrl: string;
  totalNotes: number;
  latencyMs: number;
  error?: string;
  container?: string;
  database?: string;
  host?: string;
}
