export interface Task {
  id: string;
  text: string;
  completed: boolean;
  date?: string;
  createdAt: number;
  completedAt?: number;
  category: TaskCategory;
  priority: TaskPriority;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
  tags: string[];
  description?: string;
}

export interface TaskCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number; // every X days/weeks/months
  daysOfWeek?: number[]; // for weekly (0 = Sunday)
  endDate?: string;
}

export interface Habit {
  id: string;
  name: string;
  color: string;
  icon: string;
  target: number; // target times per day/week
  currentStreak: number;
  longestStreak: number;
  completedDates: string[]; // ISO date strings
  createdAt: number;
}

export interface PomodoroSession {
  id: string;
  taskId?: string;
  startTime: number;
  endTime?: number;
  duration: number; // in minutes (25, 5, 15 for work, short break, long break)
  type: 'work' | 'short-break' | 'long-break';
  completed: boolean;
}

export interface UserStats {
  tasksCompleted: number;
  totalFocusTime: number; // in minutes
  currentStreak: number;
  longestStreak: number;
  categoriesUsed: string[];
  level: number;
  experience: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  progress: number;
  target: number;
}

export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  color: string;
  type: 'task' | 'event' | 'habit';
  relatedId: string; // task ID, habit ID, etc.
}