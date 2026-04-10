import * as React from "react";
import { ViewState } from "../types";
import {
  LayoutDashboard,
  ListTodo,
  PlayCircle,
  BookOpen,
  Calendar as CalendarIcon,
  StickyNote,
  Trash2,
  Brain,
  Briefcase,
  CheckCircle,
  Minus,
  Plus,
  Cloud,
  CloudOff,
  RefreshCw,
  LogOut,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  miniPlayer?: React.ReactNode;
  uiScale: number;
  onScaleChange: (scale: number) => void;
  syncStatus?: "idle" | "syncing" | "success" | "error";
  onLogout: () => void;
}

const VIEW_ICONS: Record<string, any> = {
  dashboard: LayoutDashboard,
  dump: Brain,
  trash: Trash2,
  calendar: CalendarIcon,
  tasks: ListTodo,
  projects: Briefcase,
  habits: CheckCircle,
  routines: PlayCircle,
  notes: StickyNote,
  journal: BookOpen,
};

const MOBILE_NAV_GROUPS = [
  { id: "dash_group", views: ["dashboard"] as ViewState[] },
  { id: "capture_group", views: ["dump", "trash"] as ViewState[] },
  { id: "plan_group", views: ["calendar", "tasks", "projects"] as ViewState[] },
  { id: "habit_group", views: ["habits", "routines"] as ViewState[] },
  { id: "record_group", views: ["notes", "journal"] as ViewState[] },
];

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentView,
  onViewChange,
  miniPlayer,
  uiScale,
  onScaleChange,
  syncStatus = "idle",
  onLogout,
}) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "dump", label: "Brain Dump", icon: Brain },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "habits", label: "Habits", icon: CheckCircle },
    { id: "calendar", label: "Calendar", icon: CalendarIcon },
    { id: "tasks", label: "Tasks", icon: ListTodo },
    { id: "routines", label: "Routines", icon: PlayCircle },
    { id: "notes", label: "Notes", icon: StickyNote },
    { id: "journal", label: "Journal", icon: BookOpen },
    { id: "trash", label: "Trash", icon: Trash2 },
  ];

  const isFullWidthView = ["calendar", "notes", "projects", "habits", "dump", "tasks"].includes(currentView);

  const handleZoom = (direction: "in" | "out") => {
    const step = 0.1;
    const newScale = direction === "in" ? uiScale + step : uiScale - step;
    onScaleChange(Math.max(0.5, Math.min(1.5, parseFloat(newScale.toFixed(1)))));
  };

  const resetZoom = () => onScaleChange(1);

  const handleMobileNavClick = (views: ViewState[]) => {
    if (views.includes(currentView)) {
      const currentIndex = views.indexOf(currentView);
      const nextIndex = (currentIndex + 1) % views.length;
      onViewChange(views[nextIndex]);
    } else {
      onViewChange(views[0]);
    }
  };

  return (
    <div
      className="fixed inset-0 overflow-hidden flex transition-all duration-200 ease-out bg-bg-mist text-secondary-navy"
      style={{
        zoom: uiScale,
        height: `calc(100dvh / ${uiScale})`,
        width: `calc(100vw / ${uiScale})`,
      }}
    >
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-surface-sage p-6 bg-white z-[70] relative shrink-0 h-full shadow-sm">
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary-navy flex items-center justify-center">
              <RefreshCw className="text-primary-teal" size={18} />
            </div>
            <h1 className="text-lg font-bold tracking-tight">ADHD Flow</h1>
          </div>
          
          {/* Sync Status Icon */}
          <div className="flex items-center gap-2" title={`Sync: ${syncStatus}`}>
            {syncStatus === "syncing" && <RefreshCw size={14} className="animate-spin text-primary-teal" />}
            {syncStatus === "success" && <Cloud size={14} className="text-primary-teal" />}
            {syncStatus === "error" && <CloudOff size={14} className="text-accent-coral" />}
            {syncStatus === "idle" && <Cloud size={14} className="text-neutral-slate" />}
          </div>
        </div>

        {miniPlayer && (
          <div className="mb-6 animate-fade-in shrink-0">{miniPlayer}</div>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar -mr-2 pr-2 min-h-0">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewState)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                currentView === item.id
                  ? "bg-surface-sage text-secondary-navy font-bold shadow-sm"
                  : "text-neutral-slate hover:bg-bg-mist hover:text-secondary-navy"
              }`}
            >
              <item.icon
                size={18}
                strokeWidth={currentView === item.id ? 2.5 : 2}
              />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {currentView !== "routine-player" && (
          <div className="mt-auto pt-6 border-t border-surface-sage shrink-0">
            <div className="bg-bg-mist rounded-2xl p-1.5 flex items-center justify-between border border-surface-sage">
              <button
                onClick={() => handleZoom("out")}
                className="p-2 hover:bg-white rounded-xl text-neutral-slate hover:text-secondary-navy transition-all"
              >
                <Minus size={16} />
              </button>
              <span
                className="text-[10px] font-bold text-neutral-slate tabular-nums cursor-pointer"
                onDoubleClick={resetZoom}
              >
                {Math.round(uiScale * 100)}%
              </span>
              <button
                onClick={() => handleZoom("in")}
                className="p-2 hover:bg-white rounded-xl text-neutral-slate hover:text-secondary-navy transition-all"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <button
              onClick={onLogout}
              className="w-full mt-4 flex items-center gap-3 px-4 py-2.5 rounded-xl text-accent-coral hover:bg-red-50 transition-all font-bold text-sm"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div
          className={`flex-1 flex flex-col h-full ${
            isFullWidthView
              ? "overflow-hidden"
              : "overflow-y-auto p-4 md:p-8 pb-32 md:pb-12 no-scrollbar"
          }`}
        >
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-surface-sage pb-safe z-[70] h-16 shrink-0 flex justify-around items-center px-2">
        {miniPlayer && (
          <div className="absolute bottom-full left-0 right-0 p-2 pointer-events-none">
            <div className="pointer-events-auto">{miniPlayer}</div>
          </div>
        )}
        {MOBILE_NAV_GROUPS.map((group) => {
          const isActive = group.views.includes(currentView);
          const viewToRender = isActive ? currentView : group.views[0];
          const IconComponent = VIEW_ICONS[viewToRender] || LayoutDashboard;

          return (
            <button
              key={group.id}
              onClick={() => handleMobileNavClick(group.views)}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive ? "text-primary-teal" : "text-neutral-slate"
              }`}
            >
              <IconComponent size={24} strokeWidth={isActive ? 2.5 : 2} />
            </button>
          );
        })}
      </nav>
    </div>
  );
};

