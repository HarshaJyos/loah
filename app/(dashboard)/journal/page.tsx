"use client";

import { useApp } from "../../../context/AppContext";
import { JournalModule } from "../../../components/JournalModule";

export default function JournalPage() {
  const { 
    journalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry,
    archiveJournalEntry, unarchiveJournalEntry
  } = useApp();

  return (
    <JournalModule 
      entries={journalEntries}
      onAddEntry={addJournalEntry}
      onUpdateEntry={updateJournalEntry}
      onDeleteEntry={deleteJournalEntry}
      onArchiveEntry={archiveJournalEntry}
      onUnarchiveEntry={unarchiveJournalEntry}
      clearPrompt={() => {}} // Placeholder for now
    />
  );
}
