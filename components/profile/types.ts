// types.ts
export interface User {
  name: string;
  email: string;
  department: string;
  passOutYear: string;
  rollNo: string;
  year: string;
}

export interface Tab {
  id: string;
  label: string;
}

export interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtext: string;
  color: string;
}

export interface ProgressStatCardProps {
  icon: React.ReactNode;
  title: string;
  progress: number;
  color : string
}

export interface Activity {
  icon: React.ReactNode;
  title: string;
  date: string;
}
