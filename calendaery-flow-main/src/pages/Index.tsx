import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Calendar from '@/components/Calendar';
import TodoList from '@/components/TodoList';
import ThemeToggle from '@/components/ThemeToggle';
import MotivationalQuote from '@/components/MotivationalQuote';
import ExportButton from '@/components/ExportButton';
import TaskCategories from '@/components/TaskCategories';
import PomodoroTimer from '@/components/PomodoroTimer';
import HabitTracker from '@/components/HabitTracker';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Task, TaskCategory, Habit, PomodoroSession } from '@/types';
import { Calendar as CalendarIcon, Target, BarChart3, Zap, Globe } from 'lucide-react';

// Language content
const content = {
  en: {
    welcome: "Welcome to DailyFocus",
    subtitle: "Your beautiful, minimalist calendar and productivity tool. Organize tasks, track habits, and boost your productivity with style.",
    tasksForToday: "Tasks for Today",
    completedToday: "Completed Today",
    activeHabits: "Active Habits",
    todaysOverview: "Today's Overview",
    quickAddTask: "Quick Add Task",
    superchargedProductivity: "Supercharged Productivity",
    allDataStored: "All data is stored locally in your browser"
  },
  fr: {
    welcome: "Bienvenue sur DailyFocus",
    subtitle: "Votre bel outil de calendrier et de productivité minimaliste. Organisez vos tâches, suivez vos habitudes et boostez votre productivité avec style.",
    tasksForToday: "Tâches pour Aujourd'hui",
    completedToday: "Terminées Aujourd'hui",
    activeHabits: "Habitudes Actives",
    todaysOverview: "Aperçu d'Aujourd'hui",
    quickAddTask: "Ajouter une Tâche",
    superchargedProductivity: "Productivité Surpuissante",
    allDataStored: "Toutes les données sont stockées localement dans votre navigateur"
  }
};

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [tasks, setTasks] = useLocalStorage<Task[]>('calendaery-tasks', []);
  const [categories, setCategories] = useLocalStorage<TaskCategory[]>('calendaery-categories', []);
  const [habits, setHabits] = useLocalStorage<Habit[]>('calendaery-habits', []);
  const [pomodoroSessions, setPomodoroSessions] = useLocalStorage<PomodoroSession[]>('calendaery-pomodoro', []);
  const [activeView, setActiveView] = useState<'welcome' | 'calendar' | 'focus' | 'analytics'>('welcome');
  const [language, setLanguage] = useState<'en' | 'fr'>('en');

  const t = content[language];

  // Calculate tasks count per date for calendar display
  const tasksCount = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach(task => {
      if (task.date) {
        counts[task.date] = (counts[task.date] || 0) + 1;
      }
    });
    return counts;
  }, [tasks]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(prevDate => 
      prevDate && prevDate.toDateString() === date.toDateString() ? null : date
    );
  };

  const handlePomodoroComplete = (session: PomodoroSession) => {
    setPomodoroSessions(prev => [...prev, session]);
  };

  const getTodayTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => task.date === today && !task.completed);
  };

  const getCompletedToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => task.date === today && task.completed);
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-40 backdrop-blur-lg border-b border-glass-border/50 bg-background/80"
      >
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center gap-2 sm:gap-4"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 gradient-primary rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg sm:text-xl">D</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-bold text-gradient">DailyFocus</h1>
              <span className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                {t.superchargedProductivity}
              </span>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Toggle */}
            <div className="flex items-center glass rounded-lg sm:rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setLanguage('en')}
                className={`
                  px-2 sm:px-3 py-1 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-200
                  ${language === 'en' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }
                `}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('fr')}
                className={`
                  px-2 sm:px-3 py-1 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-200
                  ${language === 'fr' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }
                `}
              >
                FR
              </button>
            </div>

            {/* View Toggle - Hidden on mobile, show on tablet+ */}
            <div className="hidden md:flex items-center glass rounded-xl p-1 shadow-sm">
              {[
                { key: 'welcome', label: 'Welcome', icon: Zap },
                { key: 'calendar', label: 'Calendar', icon: CalendarIcon },
                { key: 'focus', label: 'Focus', icon: Target },
                { key: 'analytics', label: 'Analytics', icon: BarChart3 }
              ].map((view) => {
                const IconComponent = view.icon;
                return (
                  <button
                    key={view.key}
                    onClick={() => setActiveView(view.key as any)}
                    className={`
                      flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200
                      ${activeView === view.key 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                      }
                    `}
                  >
                    <IconComponent className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden lg:inline">{view.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <select
                value={activeView}
                onChange={(e) => setActiveView(e.target.value as any)}
                className="glass rounded-lg px-2 py-1 text-xs border-0 bg-transparent"
                title="Select view"
                aria-label="Select view"
              >
                <option value="welcome">Welcome</option>
                <option value="calendar">Calendar</option>
                <option value="focus">Focus</option>
                <option value="analytics">Analytics</option>
              </select>
            </div>

            <ExportButton tasks={tasks} />
            <ThemeToggle />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Welcome Page */}
        {activeView === 'welcome' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Hero Section */}
            <div className="text-center space-y-3 sm:space-y-4">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="text-3xl sm:text-4xl font-bold text-gradient glow-effect"
              >
                {t.welcome}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4"
              >
                {t.subtitle}
              </motion.p>
            </div>

            {/* Motivational Quote */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="glass-card-hover"
            >
              <MotivationalQuote />
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
            >
              <motion.div 
                className="glass-card-hover text-center"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-xl sm:text-2xl font-bold text-primary mb-1">{getTodayTasks().length}</div>
                <div className="text-muted-foreground text-xs sm:text-sm">{t.tasksForToday}</div>
              </motion.div>
              <motion.div 
                className="glass-card-hover text-center"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <div className="text-xl sm:text-2xl font-bold text-success mb-1">{getCompletedToday().length}</div>
                <div className="text-muted-foreground text-xs sm:text-sm">{t.completedToday}</div>
              </motion.div>
              <motion.div 
                className="glass-card-hover text-center"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2, delay: 0.2 }}
              >
                <div className="text-xl sm:text-2xl font-bold text-warning mb-1">{habits.length}</div>
                <div className="text-muted-foreground text-xs sm:text-sm">{t.activeHabits}</div>
              </motion.div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
            >
              {/* Today's Calendar */}
              <motion.div 
                className="glass-card-hover"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-3">{t.todaysOverview}</h3>
                <Calendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  tasksCount={tasksCount}
                />
              </motion.div>

              {/* Quick Todo */}
              <motion.div 
                className="glass-card-hover"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-3">{t.quickAddTask}</h3>
                <TodoList
                  selectedDate={selectedDate}
                  tasks={tasks}
                  onTasksChange={setTasks}
                  categories={categories}
                  onCategoriesChange={setCategories}
                  selectedCategory={selectedCategory}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Calendar View */}
        {activeView === 'calendar' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Main Calendar Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
              {/* Large Calendar - Takes 2 columns on desktop, full width on mobile */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="xl:col-span-2"
              >
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <Calendar
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    tasksCount={tasksCount}
                  />
                </motion.div>
              </motion.div>

              {/* Right Side - Tasks and Habits */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="xl:col-span-2 space-y-4 sm:space-y-6"
              >
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <TodoList
                    selectedDate={selectedDate}
                    tasks={tasks}
                    onTasksChange={setTasks}
                    categories={categories}
                    onCategoriesChange={setCategories}
                    selectedCategory={selectedCategory}
                  />
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <HabitTracker
                    habits={habits}
                    onHabitsChange={setHabits}
                    selectedDate={selectedDate}
                  />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Focus View */}
        {activeView === 'focus' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
            >
              <PomodoroTimer
                onSessionComplete={handlePomodoroComplete}
                currentTaskId={tasks.find(t => !t.completed && t.date === new Date().toISOString().split('T')[0])?.id}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <TodoList
                selectedDate={selectedDate}
                tasks={tasks}
                onTasksChange={setTasks}
                categories={categories}
                onCategoriesChange={setCategories}
                selectedCategory={selectedCategory}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Analytics View */}
        {activeView === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="max-w-6xl mx-auto"
          >
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <AnalyticsDashboard
                tasks={tasks}
                habits={habits}
                pomodoroSessions={pomodoroSessions}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="text-center mt-12 sm:mt-16 text-muted-foreground text-sm"
        >
          <div className="glass rounded-lg sm:rounded-xl p-3 sm:p-4 max-w-sm mx-auto">
            <p className="font-medium text-sm sm:text-base">nouioua alaa</p>
            <p className="mt-1 text-xs">{t.allDataStored}</p>
          </div>
        </motion.footer>
      </main>
    </div>
  );
};

export default Index;
