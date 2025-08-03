import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Target, Zap, Trophy, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Task, Habit, PomodoroSession, UserStats } from '@/types';

interface AnalyticsDashboardProps {
  tasks: Task[];
  habits: Habit[];
  pomodoroSessions: PomodoroSession[];
}

const AnalyticsDashboard = ({ tasks, habits, pomodoroSessions }: AnalyticsDashboardProps) => {
  const analytics = useMemo(() => {
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Task Analytics
    const completedTasks = tasks.filter(t => t.completed);
    const completedThisWeek = completedTasks.filter(t => 
      t.completedAt && new Date(t.completedAt) >= oneWeekAgo
    );
    const completedThisMonth = completedTasks.filter(t => 
      t.completedAt && new Date(t.completedAt) >= oneMonthAgo
    );

    // Pomodoro Analytics
    const completedSessions = pomodoroSessions.filter(s => s.completed);
    const totalFocusTime = completedSessions
      .filter(s => s.type === 'work')
      .reduce((total, session) => total + session.duration, 0);
    
    const sessionsThisWeek = completedSessions.filter(s => 
      new Date(s.startTime) >= oneWeekAgo
    );

    // Habit Analytics
    const activeHabits = habits.filter(h => h.completedDates.length > 0);
    const avgHabitStreak = activeHabits.length > 0 
      ? activeHabits.reduce((sum, h) => sum + h.currentStreak, 0) / activeHabits.length 
      : 0;

    // Productivity Score (0-100)
    const taskCompletionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
    const habitConsistency = habits.length > 0 ? (avgHabitStreak / 30) * 100 : 0; // 30 days max
    const focusConsistency = totalFocusTime > 0 ? Math.min((totalFocusTime / 1000) * 100, 100) : 0; // 1000 minutes max
    const productivityScore = Math.round((taskCompletionRate + habitConsistency + focusConsistency) / 3);

    // Category breakdown
    const categoryStats = tasks.reduce((acc, task) => {
      const category = task.category.name;
      if (!acc[category]) {
        acc[category] = { total: 0, completed: 0, color: task.category.color };
      }
      acc[category].total++;
      if (task.completed) acc[category].completed++;
      return acc;
    }, {} as Record<string, { total: number; completed: number; color: string }>);

    return {
      taskCompletionRate: Math.round(taskCompletionRate),
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      completedThisWeek: completedThisWeek.length,
      completedThisMonth: completedThisMonth.length,
      totalFocusTime,
      totalSessions: completedSessions.length,
      sessionsThisWeek: sessionsThisWeek.length,
      avgHabitStreak: Math.round(avgHabitStreak),
      activeHabits: activeHabits.length,
      productivityScore,
      categoryStats
    };
  }, [tasks, habits, pomodoroSessions]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Orange
    if (score >= 40) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  };

  const achievements = [
    {
      id: 'task-master',
      name: 'Task Master',
      description: 'Complete 100 tasks',
      progress: analytics.completedTasks,
      target: 100,
      icon: '🏆'
    },
    {
      id: 'focus-warrior',
      name: 'Focus Warrior',
      description: 'Complete 50 pomodoro sessions',
      progress: analytics.totalSessions,
      target: 50,
      icon: '⚡'
    },
    {
      id: 'habit-builder',
      name: 'Habit Builder',
      description: 'Maintain 7-day habit streak',
      progress: analytics.avgHabitStreak,
      target: 7,
      icon: '🔥'
    },
    {
      id: 'productivity-master',
      name: 'Productivity Master',
      description: 'Reach 90% productivity score',
      progress: analytics.productivityScore,
      target: 90,
      icon: '🎯'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 w-full"
    >
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Analytics</h3>
      </div>

      {/* Productivity Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Productivity Score</span>
          <span className="text-2xl font-bold" style={{ color: getScoreColor(analytics.productivityScore) }}>
            {analytics.productivityScore}%
          </span>
        </div>
        <Progress 
          value={analytics.productivityScore} 
          className="h-3"
          style={{
            '--progress-background': getScoreColor(analytics.productivityScore)
          } as any}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass rounded-lg p-4 text-center">
          <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold text-foreground">{analytics.completedTasks}</div>
          <div className="text-sm text-muted-foreground">Tasks Completed</div>
          <Badge variant="outline" className="mt-2 text-xs">
            +{analytics.completedThisWeek} this week
          </Badge>
        </div>

        <div className="glass rounded-lg p-4 text-center">
          <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold text-foreground">{formatTime(analytics.totalFocusTime)}</div>
          <div className="text-sm text-muted-foreground">Focus Time</div>
          <Badge variant="outline" className="mt-2 text-xs">
            {analytics.sessionsThisWeek} sessions this week
          </Badge>
        </div>

        <div className="glass rounded-lg p-4 text-center">
          <Zap className="h-6 w-6 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold text-foreground">{analytics.avgHabitStreak}</div>
          <div className="text-sm text-muted-foreground">Avg Habit Streak</div>
          <Badge variant="outline" className="mt-2 text-xs">
            {analytics.activeHabits} active habits
          </Badge>
        </div>

        <div className="glass rounded-lg p-4 text-center">
          <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold text-foreground">{analytics.taskCompletionRate}%</div>
          <div className="text-sm text-muted-foreground">Completion Rate</div>
          <Badge variant="outline" className="mt-2 text-xs">
            {analytics.totalTasks} total tasks
          </Badge>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(analytics.categoryStats).length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">Category Performance</h4>
          <div className="space-y-2">
            {Object.entries(analytics.categoryStats).map(([category, stats]) => {
              const completionRate = (stats.completed / stats.total) * 100;
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stats.color }}
                    />
                    <span className="text-sm">{category}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {stats.completed}/{stats.total} ({Math.round(completionRate)}%)
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div>
        <h4 className="text-sm font-medium mb-3">Achievements</h4>
        <div className="grid grid-cols-2 gap-2">
          {achievements.map((achievement) => {
            const progress = Math.min((achievement.progress / achievement.target) * 100, 100);
            const isUnlocked = achievement.progress >= achievement.target;
            
            return (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.02 }}
                className={`
                  glass rounded-lg p-3 text-center border-2 transition-all duration-200
                  ${isUnlocked 
                    ? 'border-primary bg-primary/5' 
                    : 'border-transparent'
                  }
                `}
              >
                <div className={`text-xl mb-1 ${isUnlocked ? 'animate-bounce' : 'grayscale opacity-50'}`}>
                  {achievement.icon}
                </div>
                <div className="text-xs font-medium">{achievement.name}</div>
                <div className="text-xs text-muted-foreground mb-2">
                  {achievement.progress}/{achievement.target}
                </div>
                <Progress value={progress} className="h-1" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsDashboard;