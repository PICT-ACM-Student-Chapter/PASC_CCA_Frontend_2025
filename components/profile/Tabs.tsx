"use client";

import { Tab } from "./types";

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (id: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="bg-card rounded-xl shadow-sm p-2 flex gap-2 border border-card mb-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`flex-1 py-2 rounded-lg font-semibold ${
            activeTab === tab.id
              ? "bg-[var(--color-profile)] text-primary"
              : "text-secondary"
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};