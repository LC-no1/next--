import { getDbHealthAction, getNotesAction } from '@/app/actions/notes';
import NotesBoard from '@/components/NotesBoard';
import { NoteItem } from '@/types/note';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let notes: NoteItem[] = [];
  const dbStatus = await getDbHealthAction();

  if (dbStatus.connected) {
    try {
      notes = await getNotesAction();
    } catch (err) {
      console.error('Error fetching initial notes:', err);
    }
  }

  return (
    <main className="flex-1 min-h-[100dvh]">
      <NotesBoard initialNotes={notes} dbStatus={dbStatus} />
    </main>
  );
}
