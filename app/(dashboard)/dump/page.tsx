"use client";

import { useApp } from "../../../context/AppContext";
import { BrainDumpModule } from "../../../components/BrainDumpModule";

export default function BrainDumpPage() {
  const { 
    dumps, addDump, deleteDump, 
    handleConvertToTask, handleConvertToNote, 
    handleConvertToJournal, handleConvertToProject,
    archiveDump, unarchiveDump
  } = useApp();

  return (
    <BrainDumpModule 
      dumps={dumps}
      onAddDump={addDump}
      onDeleteDump={deleteDump}
      onConvertToTask={handleConvertToTask}
      onConvertToNote={handleConvertToNote}
      onConvertToJournal={handleConvertToJournal}
      onConvertToProject={handleConvertToProject}
      onArchiveDump={archiveDump}
      onUnarchiveDump={unarchiveDump}
    />
  );
}
