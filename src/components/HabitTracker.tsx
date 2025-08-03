import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Flame, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Habit } from '@/types';

interface HabitTrackerProps {
  habits: Habit[];
  onHabitsChange: (habits: Habit[]) => void;
  selectedDate: Date | null;
}

const habitIcons = ['🏃', '💧', '📚', '🧘', '💪', '🥗', '😴', '📝', '🎯', '🔥'];
const habitColors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

const HabitTracker = ({ habits, onHabitsChange, selectedDate }: HabitTrackerProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    icon: habitIcons[0],
    color: habitColors[0],
    target: 1
  });

  const today = new Date().toISOString().split('T')[0];
  const selectedDateKey = selectedDate?.toISOString().split('T')[0] || today;

  const addHabit = () => {
    if (!newHabit.name.trim()) return;
    
    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name.trim(),
      color: newHabit.color,
      icon: newHabit.icon,
      target: newHabit.target,
      currentStreak: 0,
      longestStreak: 0,
      completedDates: [],
      createdAt: Date.now()
    };
    
    onHabitsChange([...habits, habit]);
    setNewHabit({ name: '', icon: habitIcons[0], color: habitColors[0], target: 1 });
    setShowAddForm(false);
  };

  const toggleHabitCompletion = (habitId: string) => {
    const updatedHabits = habits.map(habit => {
      if (habit.id !== habitId) return habit;
      
      const isCompleted = habit.completedDates.includes(selectedDateKey);
      let completedDates: string[];
      
      if (isCompleted) {
        // Remove completion
        completedDates = habit.completedDates.filter(date => date !== selectedDateKey);
      } else {
        // Add completion
        completedDates = [...habit.completedDates, selectedDateKey].sort();
      }
      
      // Calculate new streak
      const sortedDates = completedDates.sort();
      let currentStreak = 0;
      
      if (sortedDates.length > 0) {
        // Calculate streak from today backwards
        const todayDate = new Date(today);
        let checkDate = new Date(todayDate);
        
        while (true) {
          const checkDateKey = checkDate.toISOString().split('T')[0];
          if (sortedDates.includes(checkDateKey)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
      
      return {
        ...habit,
        completedDates,
        currentStreak,
        longestStreak: Math.max(habit.longestStreak, currentStreak)
      };
    });
    
    onHabitsChange(updatedHabits);
  };

  const getCompletionProgress = (habit: Habit) => {
    const completionsToday = habit.completedDates.filter(date => date === selectedDateKey).length;
    return Math.min((completionsToday / habit.target) * 100, 100);
  };

  const isCompletedToday = (habit: Habit) => {
    return habit.completedDates.includes(selectedDateKey);
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return '#EF4444'; // Red for 30+ days
    if (streak >= 14) return '#F59E0B'; // Orange for 14+ days
    if (streak >= 7) return '#10B981';  // Green for 7+ days
    if (streak >= 3) return '#3B82F6';  // Blue for 3+ days
    return '#6B7280'; // Gray for less than 3 days
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 w-full max-w-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Daily Habits</h3>
          <p className="text-sm text-muted-foreground">
            {selectedDate ? selectedDate.toLocaleDateString() : 'Today'}
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          size="sm"
          className="gradient-primary text-white rounded-full"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Add Habit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="glass rounded-lg p-4 space-y-3">
              <Input
                value={newHabit.name}
                onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                placeholder="Habit name (e.g., Drink 8 glasses of water)"
                className="border-0 bg-transparent"
              />
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">Icon:</p>
                  <div className="flex gap-2 flex-wrap">
                    {habitIcons.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setNewHabit({ ...newHabit, icon })}
                        className={`p-2 rounded-lg border-2 ${
                          newHabit.icon === icon ? 'border-primary' : 'border-transparent bg-muted'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Daily Target:</p>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={newHabit.target}
                    onChange={(e) => setNewHabit({ ...newHabit, target: parseInt(e.target.value) || 1 })}
                    className="w-20 border-0 bg-transparent"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Color:</p>
                <div className="flex gap-2">
                  {habitColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewHabit({ ...newHabit, color })}
                      className={`w-6 h-6 rounded-full border-2 ${
                        newHabit.color === color ? 'border-foreground' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={addHabit} size="sm" disabled={!newHabit.name.trim()}>
                  Add Habit
                </Button>
                <Button onClick={() => setShowAddForm(false)} size="sm" variant="ghost">
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habits List */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No habits yet</p>
            <p className="text-xs mt-1">Click + to add your first habit</p>
          </div>
        ) : (
          habits.map((habit) => {
            const progress = getCompletionProgress(habit);
            const completed = isCompletedToday(habit);
            
            return (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-lg p-4 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={() => toggleHabitCompletion(habit.id)}
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-xl
                      border-2 transition-all duration-200 hover:scale-105
                      ${completed 
                        ? 'border-success bg-success text-white' 
                        : 'border-muted hover:border-primary'
                      }
                    `}
                    style={{
                      backgroundColor: completed ? habit.color : undefined,
                      borderColor: completed ? habit.color : undefined
                    }}
                  >
                    {habit.icon}
                  </button>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{habit.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        <Flame className="h-3 w-3 mr-1" style={{ color: getStreakColor(habit.currentStreak) }} />
                        {habit.currentStreak} day streak
                      </Badge>
                      {habit.longestStreak > habit.currentStreak && (
                        <Badge variant="outline" className="text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Best: {habit.longestStreak}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {Math.min(habit.completedDates.filter(d => d === selectedDateKey).length, habit.target)} / {habit.target}
                    </span>
                  </div>
                  <Progress 
                    value={progress} 
                    className="h-2"
                    style={{
                      '--progress-background': habit.color
                    } as any}
                  />
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default HabitTracker;