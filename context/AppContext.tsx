"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { googleLogout } from "@react-oauth/google";
import { 
  Task, Routine, JournalEntry, Note, FocusSession, 
  Dump, Project, Habit, PausedRoutine, StepLog, Reminder 
} from "../types";
import { driveService } from "../utils/googleDriveService";
import { playSound } from "../utils/sounds";

const STORAGE_KEYS = {
  TASKS: "lifeflow_tasks",
  ROUTINES: "lifeflow_routines",
  JOURNAL: "lifeflow_journal",
  NOTES: "lifeflow_notes",
  SESSIONS: "lifeflow_sessions",
  DUMPS: "lifeflow_dumps",
  PROJECTS: "lifeflow_projects",
  HABITS: "lifeflow_habits",
  PAUSED: "lifeflow_paused_routines",
  UI_SCALE: "lifeflow_ui_scale",
  CURRENT_VIEW: "lifeflow_current_view",
  AUTH_TOKEN: "lifeflow_auth_token",
};

const INITIAL_ROUTINES: Routine[] = [
  {
    id: "r1",
    title: "Morning Protocol",
    color: "bg-indigo-600",
    type: "repeatable",
    steps: [
      { id: "s1", title: "Drink Water", durationSeconds: 60 },
      { id: "s2", title: "Meditation", durationSeconds: 300 },
      { id: "s3", title: "Quick Stretch", durationSeconds: 180 },
    ],
  },
];

interface AppContextType {
  accessToken: string | null;
  isSyncing: boolean;
  isInitialLoading: boolean;
  syncStatus: "idle" | "syncing" | "success" | "error";
  tasks: Task[];
  routines: Routine[];
  journalEntries: JournalEntry[];
  notes: Note[];
  dumps: Dump[];
  projects: Project[];
  habits: Habit[];
  focusSessions: FocusSession[];
  pausedRoutines: PausedRoutine[];
  uiScale: number;
  handleLoginSuccess: (token: string) => Promise<void>;
  setUiScale: React.Dispatch<React.SetStateAction<number>>;

  // Handlers
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  startTask: (task: Task) => void;
  archiveTask: (id: string) => void;
  unarchiveTask: (id: string) => void;

  addHabit: (habit: Habit) => void;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (id: string) => void;
  archiveHabit: (id: string) => void;
  unarchiveHabit: (id: string) => void;
  updateProgress: (id: string, dateStr: string, value: number) => void;

  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  archiveProject: (id: string) => void;
  unarchiveProject: (id: string) => void;
  reorderProjects: (projects: Project[]) => void;

  addRoutine: (routine: Routine) => void;
  updateRoutine: (routine: Routine) => void;
  deleteRoutine: (id: string) => void;
  startRoutine: (id: string) => void;
  resumeRoutine: (paused: PausedRoutine) => void;
  discardPaused: (id: string) => void;
  archiveRoutine: (id: string) => void;
  unarchiveRoutine: (id: string) => void;

  addNote: (note: Note) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  archiveNote: (id: string) => void;
  unarchiveNote: (id: string) => void;
  reorderNotes: (notes: Note[]) => void;

  addJournalEntry: (entry: JournalEntry) => void;
  updateJournalEntry: (entry: JournalEntry) => void;
  deleteJournalEntry: (id: string) => void;
  archiveJournalEntry: (id: string) => void;
  unarchiveJournalEntry: (id: string) => void;

  addDump: (dump: Dump) => void;
  deleteDump: (id: string) => void;
  archiveDump: (id: string) => void;
  unarchiveDump: (id: string) => void;
  handleConvertToTask: (dump: Dump) => void;
  handleConvertToNote: (dump: Dump) => void;
  handleConvertToJournal: (dump: Dump) => void;
  handleConvertToProject: (dump: Dump) => void;

  startFocus: (session: FocusSession) => void;
  unscheduleItem: (id: string, type: 'task' | 'routine') => void;
  scheduleRoutine: (templateId: string, startTime: number) => void;
  scheduleHabit: (habitId: string, startTime: number) => void;
  startHabitFocus: (habit: Habit) => void;

  restoreItem: (id: string, type: string) => void;
  deleteForever: (id: string, type: string) => void;
  deleteActivity: (id: string, type: "task" | "session" | "journal") => void;
  exportData: () => void;
  importData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetApp: () => void;

  activeSession: {
    routine: Routine;
    currentStepIndex: number;
    timeElapsed: number;
    isPlaying: boolean;
    isMinimized: boolean;
  } | null;
  setActiveSession: (session: any) => void;
  updateSessionTime: (delta: number) => void;
  nextStep: () => void;
  togglePlay: () => void;
  minimizeSession: () => void;
  exitSession: () => void;
  saveSession: () => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [routines, setRoutines] = useState<Routine[]>(INITIAL_ROUTINES);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [dumps, setDumps] = useState<Dump[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [pausedRoutines, setPausedRoutines] = useState<PausedRoutine[]>([]);
  const [uiScale, setUiScale] = useState(1);
  const [activeSession, setActiveSession] = useState<{
    routine: Routine;
    currentStepIndex: number;
    timeElapsed: number;
    isPlaying: boolean;
    isMinimized: boolean;
  } | null>(null);

  // Timer Logic for Active Session
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSession?.isPlaying) {
      interval = setInterval(() => {
        setActiveSession(prev => {
          if (!prev) return null;
          return { ...prev, timeElapsed: prev.timeElapsed + 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession?.isPlaying]);

  // Initial Load from LocalStorage
  useEffect(() => {
    const load = <T,>(key: string, fallback: T): T => {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    };

    setTasks(load(STORAGE_KEYS.TASKS, []));
    setRoutines(load(STORAGE_KEYS.ROUTINES, INITIAL_ROUTINES));
    setJournalEntries(load(STORAGE_KEYS.JOURNAL, []));
    setNotes(load(STORAGE_KEYS.NOTES, []));
    setDumps(load(STORAGE_KEYS.DUMPS, []));
    setProjects(load(STORAGE_KEYS.PROJECTS, []));
    setHabits(load(STORAGE_KEYS.HABITS, []));
    setFocusSessions(load(STORAGE_KEYS.SESSIONS, []));
    setPausedRoutines(load(STORAGE_KEYS.PAUSED, []));
    setUiScale(load(STORAGE_KEYS.UI_SCALE, 1));
    
    // Auth Rehydration
    const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (storedToken) {
      handleLoginSuccess(storedToken).finally(() => {
        setIsInitialLoading(false);
      });
    } else {
      setIsInitialLoading(false);
    }
  }, []);

  // Sync Login Handler
  const handleLoginSuccess = async (token: string) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    setAccessToken(token);
    driveService.setToken(token);
    setIsSyncing(true);
    setSyncStatus("syncing");
    
    try {
      const [remoteTasks, remoteHabits, remoteProjects, remoteDumps, remoteNotes, remoteJournal] = await Promise.all([
        driveService.downloadFile<Task[]>("tasks.json"),
        driveService.downloadFile<Habit[]>("habits.json"),
        driveService.downloadFile<Project[]>("projects.json"),
        driveService.downloadFile<Dump[]>("dumps.json"),
        driveService.downloadFile<Note[]>("notes.json"),
        driveService.downloadFile<JournalEntry[]>("journal.json"),
      ]);

      if (remoteTasks) setTasks(remoteTasks);
      if (remoteHabits) setHabits(remoteHabits);
      if (remoteProjects) setProjects(remoteProjects);
      if (remoteDumps) setDumps(remoteDumps);
      if (remoteNotes) setNotes(remoteNotes);
      if (remoteJournal) setJournalEntries(remoteJournal);

      setSyncStatus("success");
    } catch (error) {
      console.error("Failed to sync from Drive:", error);
      setSyncStatus("error");
    } finally {
      setIsSyncing(false);
    }
  };

  // Drive Auto-Save Effects
  useEffect(() => { if (accessToken) driveService.syncTasks(tasks); }, [tasks, accessToken]);
  useEffect(() => { if (accessToken) driveService.syncHabits(habits); }, [habits, accessToken]);
  useEffect(() => { if (accessToken) driveService.syncProjects(projects); }, [projects, accessToken]);
  useEffect(() => { if (accessToken) driveService.syncDumps(dumps); }, [dumps, accessToken]);
  useEffect(() => { if (accessToken) driveService.syncNotes(notes); }, [notes, accessToken]);
  useEffect(() => { if (accessToken) driveService.syncJournal(journalEntries); }, [journalEntries, accessToken]);

  // LocalStorage backups
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects)); }, [projects]);

  // Task Handlers
  const addTask = (task: Task) => setTasks(prev => [...prev, task]);
  const updateTask = (task: Task) => setTasks(prev => prev.map(t => t.id === task.id ? task : t));
  const deleteTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, deletedAt: Date.now() } : t));
  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted, completedAt: !t.isCompleted ? Date.now() : undefined } : t));
  const archiveTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, archivedAt: Date.now() } : t));
  const unarchiveTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, archivedAt: undefined } : t));
  const startTask = (task: Task) => playSound("TIMER_START"); // Placeholder

  // Habit Handlers
  const addHabit = (habit: Habit) => setHabits(prev => [...prev, habit]);
  const updateHabit = (habit: Habit) => setHabits(prev => prev.map(h => h.id === habit.id ? habit : h));
  const deleteHabit = (id: string) => setHabits(prev => prev.map(h => h.id === id ? { ...h, deletedAt: Date.now() } : h));
  const archiveHabit = (id: string) => setHabits(prev => prev.map(h => h.id === id ? { ...h, archivedAt: Date.now() } : h));
  const unarchiveHabit = (id: string) => setHabits(prev => prev.map(h => h.id === id ? { ...h, archivedAt: undefined } : h));
  const updateProgress = (id: string, dateStr: string, value: number) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const newHistory = { ...h.history, [dateStr]: value };
      return { ...h, history: newHistory };
    }));
  };

  // Project Handlers
  const addProject = (project: Project) => setProjects(prev => [...prev, project]);
  const updateProject = (project: Project) => setProjects(prev => prev.map(p => p.id === project.id ? project : p));
  const deleteProject = (id: string) => setProjects(prev => prev.map(p => p.id === id ? { ...p, deletedAt: Date.now() } : p));
  const archiveProject = (id: string) => setProjects(prev => prev.map(p => p.id === id ? { ...p, archivedAt: Date.now() } : p));
  const unarchiveProject = (id: string) => setProjects(prev => prev.map(p => p.id === id ? { ...p, archivedAt: undefined } : p));
  const reorderProjects = (list: Project[]) => setProjects(list);

  // Routine Handlers
  const addRoutine = (routine: Routine) => setRoutines(prev => [...prev, routine]);
  const updateRoutine = (routine: Routine) => setRoutines(prev => prev.map(r => r.id === routine.id ? routine : r));
  const deleteRoutine = (id: string) => setRoutines(prev => prev.map(r => r.id === id ? { ...r, deletedAt: Date.now() } : r));
  const archiveRoutine = (id: string) => setRoutines(prev => prev.map(r => r.id === id ? { ...r, archivedAt: Date.now() } : r));
  const unarchiveRoutine = (id: string) => setRoutines(prev => prev.map(r => r.id === id ? { ...r, archivedAt: undefined } : r));
  const startRoutine = (id: string) => {
    const routine = routines.find(r => r.id === id);
    if (!routine) return;
    setActiveSession({
      routine,
      currentStepIndex: 0,
      timeElapsed: 0,
      isPlaying: true,
      isMinimized: false
    });
  };
  const resumeRoutine = (paused: PausedRoutine) => {
    setPausedRoutines(prev => prev.filter(p => p.id !== paused.id));
    setActiveSession({
      routine: paused.routine,
      currentStepIndex: paused.currentStepIndex,
      timeElapsed: paused.timeElapsed,
      isPlaying: true,
      isMinimized: false
    });
  };
  const discardPaused = (id: string) => setPausedRoutines(prev => prev.filter(p => p.id !== id));

  // Note Handlers
  const addNote = (note: Note) => setNotes(prev => [...prev, note]);
  const updateNote = (note: Note) => setNotes(prev => prev.map(n => n.id === note.id ? note : n));
  const deleteNote = (id: string) => setNotes(prev => prev.map(n => n.id === id ? { ...n, deletedAt: Date.now() } : n));
  const archiveNote = (id: string) => setNotes(prev => prev.map(n => n.id === id ? { ...n, archivedAt: Date.now() } : n));
  const unarchiveNote = (id: string) => setNotes(prev => prev.map(n => n.id === id ? { ...n, archivedAt: undefined } : n));
  const reorderNotes = (list: Note[]) => setNotes(list);

  // Journal Handlers
  const addJournalEntry = (entry: JournalEntry) => setJournalEntries(prev => [...prev, entry]);
  const updateJournalEntry = (entry: JournalEntry) => setJournalEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
  const deleteJournalEntry = (id: string) => setJournalEntries(prev => prev.map(e => e.id === id ? { ...e, deletedAt: Date.now() } : e));
  const archiveJournalEntry = (id: string) => setJournalEntries(prev => prev.map(e => e.id === id ? { ...e, archivedAt: Date.now() } : e));
  const unarchiveJournalEntry = (id: string) => setJournalEntries(prev => prev.map(e => e.id === id ? { ...e, archivedAt: undefined } : e));

  // Dump Handlers
  const addDump = (dump: Dump) => setDumps(prev => [...prev, dump]);
  const deleteDump = (id: string) => setDumps(prev => prev.map(d => d.id === id ? { ...d, deletedAt: Date.now() } : d));
  const archiveDump = (id: string) => setDumps(prev => prev.map(d => d.id === id ? { ...d, archivedAt: Date.now() } : d));
  const unarchiveDump = (id: string) => setDumps(prev => prev.map(d => d.id === id ? { ...d, archivedAt: undefined } : d));

  const handleConvertToTask = (dump: Dump) => {
    deleteDump(dump.id);
    addTask({
      id: Date.now().toString(),
      title: dump.title,
      description: dump.description,
      isCompleted: false,
      priority: 'Medium',
      category: 'Work',
      createdAt: Date.now(),
    });
  };

  const handleConvertToNote = (dump: Dump) => {
    deleteDump(dump.id);
    addNote({
      id: Date.now().toString(),
      title: dump.title,
      content: dump.description,
      type: 'text',
      isPinned: false,
      color: '#ffffff',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  };

  const handleConvertToJournal = (dump: Dump) => {
    deleteDump(dump.id);
    addJournalEntry({
      id: Date.now().toString(),
      title: dump.title,
      content: dump.description,
      mood: 'neutral',
      tags: ['Brain Dump'],
      createdAt: Date.now()
    });
  };

  const handleConvertToProject = (dump: Dump) => {
    deleteDump(dump.id);
    addProject({
      id: Date.now().toString(),
      title: dump.title,
      description: dump.description,
      startDate: Date.now(),
      dueDate: Date.now() + 86400000 * 7,
      color: '#3b82f6',
      status: 'active',
      priority: 'Medium',
      createdAt: Date.now()
    });
  };

  // Misc
  const addFocusSession = (session: FocusSession) => setFocusSessions(prev => [...prev, session]);
  
  const startHabitFocus = (habit: Habit) => {
    const newRoutine: Routine = {
      id: `habit-${Date.now()}`,
      title: habit.title,
      color: habit.color,
      type: 'repeatable',
      steps: [{ id: `step-${Date.now()}`, title: habit.title, durationSeconds: (habit.goal.target || 5) * 60 }]
    };
    setActiveSession({
      routine: newRoutine,
      currentStepIndex: 0,
      timeElapsed: 0,
      isPlaying: true,
      isMinimized: false
    });
  };

  const unscheduleItem = (id: string, type: 'task' | 'routine') => {
    if (type === 'task') setTasks(prev => prev.map(t => t.id === id ? { ...t, startTime: undefined } : t));
    else setRoutines(prev => prev.map(r => r.id === id ? { ...r, startTime: undefined } : r));
  };
  const scheduleRoutine = (templateId: string, startTime: number) => {
    const template = routines.find(r => r.id === templateId);
    if (!template) return;
    const newRoutine = { ...template, id: Date.now().toString(), startTime };
    setRoutines(prev => [...prev, newRoutine]);
  };
  const scheduleHabit = (habitId: string, startTime: number) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    const newRoutine: Routine = {
      id: `habit-${Date.now()}`,
      title: habit.title,
      color: habit.color,
      type: 'repeatable',
      startTime,
      steps: [{ id: `step-${Date.now()}`, title: habit.title, durationSeconds: (habit.goal.target || 5) * 60 }]
    };
    setRoutines(prev => [...prev, newRoutine]);
  };

  const restoreItem = (id: string, type: string) => {
    const restore = (list: any[]) => list.map(item => item.id === id ? { ...item, deletedAt: undefined } : item);
    switch (type) {
      case 'task': setTasks(prev => restore(prev)); break;
      case 'routine': setRoutines(prev => restore(prev)); break;
      case 'journal': setJournalEntries(prev => restore(prev)); break;
      case 'note': setNotes(prev => restore(prev)); break;
      case 'dump': setDumps(prev => restore(prev)); break;
      case 'project': setProjects(prev => restore(prev)); break;
      case 'habit': setHabits(prev => restore(prev)); break;
    }
  };

  const deleteForever = (id: string, type: string) => {
    const permanent = (list: any[]) => list.filter(item => item.id !== id);
    switch (type) {
      case 'task': setTasks(prev => permanent(prev)); break;
      case 'routine': setRoutines(prev => permanent(prev)); break;
      case 'journal': setJournalEntries(prev => permanent(prev)); break;
      case 'note': setNotes(prev => permanent(prev)); break;
      case 'dump': setDumps(prev => permanent(prev)); break;
      case 'project': setProjects(prev => permanent(prev)); break;
      case 'habit': setHabits(prev => permanent(prev)); break;
    }
  };

  const deleteActivity = (id: string, type: "task" | "session" | "journal") => {
    if (type === 'task') setTasks(prev => prev.map(t => t.id === id ? { ...t, completedAt: undefined, isCompleted: false } : t));
    else if (type === 'session') setFocusSessions(prev => prev.filter(s => s.id !== id));
    else if (type === 'journal') deleteJournalEntry(id);
  };

  const exportData = () => {
    const data = { tasks, habits, projects, dumps, notes, journalEntries, routines, focusSessions };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `adhd-flow-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.tasks) setTasks(data.tasks);
        if (data.habits) setHabits(data.habits);
        if (data.projects) setProjects(data.projects);
        if (data.dumps) setDumps(data.dumps);
        if (data.notes) setNotes(data.notes);
        if (data.journalEntries) setJournalEntries(data.journalEntries);
        if (data.routines) setRoutines(data.routines);
        if (data.focusSessions) setFocusSessions(data.focusSessions);
        alert("Data imported successfully!");
      } catch (err) {
        alert("Failed to import data. Invalid JSON.");
      }
    };
    reader.readAsText(file);
  };

  const resetApp = () => {
    if (window.confirm("Are you sure? This will delete all local data.")) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      setTasks([]);
      setHabits([]);
      setProjects([]);
      setDumps([]);
      setNotes([]);
      setJournalEntries([]);
      setRoutines(INITIAL_ROUTINES);
      setFocusSessions([]);
      setPausedRoutines([]);
      localStorage.clear();
      window.location.reload();
    }
  };

  const logout = () => {
    googleLogout();
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    setAccessToken(null);
    setTasks([]);
    setHabits([]);
    setProjects([]);
    setDumps([]);
    setNotes([]);
    setJournalEntries([]);
    setRoutines(INITIAL_ROUTINES);
    setFocusSessions([]);
    setPausedRoutines([]);
    setActiveSession(null);
  };

  const updateSessionTime = (delta: number) => {
    setActiveSession(prev => {
      if (!prev) return null;
      return { ...prev, timeElapsed: Math.max(0, prev.timeElapsed + delta) };
    });
  };

  const nextStep = () => {
    if (!activeSession) return;

    if (activeSession.currentStepIndex >= activeSession.routine.steps.length - 1) {
      // Complete routine
      const sessionResult: FocusSession = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        routineId: activeSession.routine.id,
        routineTitle: activeSession.routine.title,
        startTime: Date.now() - (activeSession.timeElapsed * 1000), // Approximate
        endTime: Date.now(),
        durationSeconds: activeSession.timeElapsed,
        totalSteps: activeSession.routine.steps.length,
        completedSteps: activeSession.routine.steps.length,
        logs: []
      };
      setFocusSessions(s => [...s, sessionResult]);
      setActiveSession(null);
    } else {
      setActiveSession(prev => prev ? { ...prev, currentStepIndex: prev.currentStepIndex + 1, timeElapsed: 0 } : null);
    }
  };

  const togglePlay = () => setActiveSession(prev => prev ? { ...prev, isPlaying: !prev.isPlaying } : null);
  const minimizeSession = () => setActiveSession(prev => prev ? { ...prev, isMinimized: true } : null);
  
  const exitSession = () => {
    if (window.confirm("Exit session? Progress will be lost.")) {
      setActiveSession(null);
    }
  };

  const saveSession = () => {
    // Save as paused
    if (activeSession) {
      const paused: PausedRoutine = {
        id: Date.now().toString(),
        routine: activeSession.routine,
        currentStepIndex: activeSession.currentStepIndex,
        timeElapsed: activeSession.timeElapsed,
        pausedAt: Date.now()
      };
      setPausedRoutines(prev => [...prev, paused]);
      setActiveSession(null);
    }
  };

  return (
    <AppContext.Provider value={{
      accessToken, isSyncing, isInitialLoading, syncStatus,
      tasks, routines, journalEntries, notes, dumps, projects, habits, focusSessions, pausedRoutines, uiScale,
      handleLoginSuccess,
      setUiScale,
      addTask, updateTask, deleteTask, toggleTask, startTask, archiveTask, unarchiveTask,
      addHabit, updateHabit, deleteHabit, archiveHabit, unarchiveHabit, updateProgress,
      addProject, updateProject, deleteProject, archiveProject, unarchiveProject, reorderProjects,
      addRoutine, updateRoutine, deleteRoutine, startRoutine, resumeRoutine, discardPaused, archiveRoutine, unarchiveRoutine,
      addNote, updateNote, deleteNote, archiveNote, unarchiveNote, reorderNotes,
      addJournalEntry, updateJournalEntry, deleteJournalEntry, archiveJournalEntry, unarchiveJournalEntry,
      addDump, deleteDump, archiveDump, unarchiveDump, handleConvertToTask, handleConvertToNote, handleConvertToJournal, handleConvertToProject,
      startFocus: addFocusSession, 
      startHabitFocus,
      unscheduleItem, scheduleRoutine, scheduleHabit,
      restoreItem, deleteForever, deleteActivity,
      exportData, importData, resetApp, logout,
      activeSession, setActiveSession, updateSessionTime, nextStep, togglePlay, minimizeSession, exitSession, saveSession
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
