"use client";

import { useApp } from "../../../context/AppContext";
import { NotesModule } from "../../../components/NotesModule";

export default function NotesPage() {
  const { 
    notes, addNote, updateNote, deleteNote, 
    archiveNote, unarchiveNote, reorderNotes 
  } = useApp();

  return (
    <NotesModule 
      notes={notes}
      onAddNote={addNote}
      onUpdateNote={updateNote}
      onDeleteNote={deleteNote}
      onArchiveNote={archiveNote}
      onUnarchiveNote={unarchiveNote}
      onReorder={reorderNotes}
    />
  );
}
