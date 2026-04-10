"use client";

import { useApp } from "../../../context/AppContext";
import { CalendarModule } from "../../../components/CalendarModule";

export default function CalendarPage() {
  const { 
    tasks, routines, habits, projects, focusSessions,
    updateTask, startTask, scheduleRoutine, startRoutine,
    updateRoutine, scheduleHabit, unscheduleItem
  } = useApp();

  return (
    <CalendarModule 
      tasks={tasks}
      routines={routines}
      habits={habits}
      projects={projects}
      focusSessions={focusSessions}
      onUpdateTask={updateTask}
      onStartTask={startTask}
      onScheduleRoutine={scheduleRoutine}
      onStartRoutine={startRoutine}
      onUpdateRoutine={updateRoutine}
      onScheduleHabit={scheduleHabit}
      onUnschedule={unscheduleItem}
    />
  );
}
