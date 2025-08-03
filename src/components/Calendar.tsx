import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  tasksCount: Record<string, number>;
}

const Calendar = ({ selectedDate, onDateSelect, tasksCount }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const getDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getTaskCount = (date: Date | null) => {
    if (!date) return 0;
    return tasksCount[getDateKey(date)] || 0;
  };

  const days = getDaysInMonth(currentDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass rounded-lg p-4 w-full shadow-lg"
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="glass-hover rounded-full p-1 h-auto hover:bg-accent/50 hover:scale-110 transition-all duration-200"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <motion.h2
          key={currentDate.getMonth()}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-lg font-bold text-foreground"
        >
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </motion.h2>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="glass-hover rounded-full p-1 h-auto hover:bg-accent/50 hover:scale-110 transition-all duration-200"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-bold text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.2, 
              delay: index * 0.005,
              type: "spring",
              stiffness: 300
            }}
            className="aspect-square"
          >
            {date && (
              <button
                onClick={() => onDateSelect(date)}
                className={`
                  w-full h-full rounded-lg flex flex-col items-center justify-center relative
                  transition-all duration-200 text-xs font-medium group
                  ${isSelected(date) 
                    ? 'bg-primary text-primary-foreground shadow-md scale-105 ring-2 ring-primary/30' 
                    : isToday(date)
                    ? 'bg-primary/20 text-primary font-semibold ring-2 ring-primary/30 hover:bg-primary/30'
                    : 'hover:bg-accent/50 hover:text-accent-foreground hover:scale-105 hover:shadow-sm'
                  }
                `}
              >
                <span className="relative z-10">{date.getDate()}</span>
                {getTaskCount(date) > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-sm"
                  >
                    {getTaskCount(date)}
                  </motion.div>
                )}
                {!isSelected(date) && !isToday(date) && (
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                )}
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Calendar Legend */}
      <div className="mt-4 pt-3 border-t border-glass-border/50">
        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary/20 ring-1 ring-primary/30"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-accent/50"></div>
            <span>Has Tasks</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Calendar;