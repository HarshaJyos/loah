"use client";

import { useApp } from "../../../context/AppContext";
import { SettingsModule } from "../../../components/SettingsModule";

export default function SettingsPage() {
  const { exportData, importData, resetApp } = useApp();

  return (
    <SettingsModule 
      onExport={exportData}
      onImport={importData}
      onReset={resetApp}
    />
  );
}
