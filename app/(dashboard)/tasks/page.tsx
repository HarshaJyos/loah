"use client";

import { useApp } from "../../../context/AppContext";
import { TaskModule } from "../../../components/TaskModule";

export default function TasksPage() {
  const { 
    tasks, projects, addTask, updateTask, deleteTask, 
    startTask, toggleTask, archiveTask, unarchiveTask 
  } = useApp();

  // Helper to filter active projects for the task selector
  const availableProjects = (projects || []).filter(p => !p.deletedAt && !p.archivedAt);

  return (
    <TaskModule 
      tasks={tasks}
      projects={availableProjects}
      onAddTask={addTask}
      onUpdateTask={updateTask}
      onDeleteTask={deleteTask}
      onStartTask={startTask}
      onToggleTask={toggleTask}
      onArchiveTask={archiveTask}
      onUnarchiveTask={unarchiveTask}
    />
  );
}
