"use client";

import { useApp } from "../../../context/AppContext";
import { ProjectModule } from "../../../components/ProjectModule";

export default function ProjectsPage() {
  const { 
    projects, tasks, focusSessions, addProject, updateProject, deleteProject,
    archiveProject, unarchiveProject, addTask, updateTask, deleteTask,
    startTask, toggleTask, reorderProjects
  } = useApp();

  return (
    <ProjectModule 
      projects={projects}
      tasks={tasks}
      focusSessions={focusSessions}
      onAddProject={addProject}
      onUpdateProject={updateProject}
      onDeleteProject={deleteProject}
      onArchiveProject={archiveProject}
      onUnarchiveProject={unarchiveProject}
      onAddTask={addTask}
      onUpdateTask={updateTask}
      onDeleteTask={deleteTask}
      onStartTask={startTask}
      onToggleTask={toggleTask}
      onReorder={reorderProjects}
    />
  );
}
