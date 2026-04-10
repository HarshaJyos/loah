"use client";

import { useApp } from "../../../context/AppContext";
import { ActivityModule } from "../../../components/ActivityModule";
import { useRouter } from "next/navigation";

export default function ActivityPage() {
  const { 
    tasks, focusSessions, journalEntries, deleteActivity
  } = useApp();
  const router = useRouter();

  return (
    <ActivityModule 
      tasks={tasks}
      focusSessions={focusSessions}
      journalEntries={journalEntries}
      onDeleteActivity={deleteActivity}
      onBack={() => router.back()}
    />
  );
}
