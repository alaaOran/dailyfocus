import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PomodoroSession } from '@/types';

interface PomodoroTimerProps {
  onSessionComplete: (session: PomodoroSession) => void;
  currentTaskId?: string;
}

const TIMER_TYPES = {
  work: { duration: 25, label: 'Focus Time', icon: Target, color: '#EF4444' },
  'short-break': { duration: 5, label: 'Short Break', icon: Coffee, color: '#10B981' },
  'long-break': { duration: 15, label: 'Long Break', icon: Coffee, color: '#3B82F6' }
};

const PomodoroTimer = ({ onSessionComplete, currentTaskId }: PomodoroTimerProps) => {
  const [currentType, setCurrentType] = useState<'work' | 'short-break' | 'long-break'>('work');
  const [timeLeft, setTimeLeft] = useState(TIMER_TYPES.work.duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null);
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  const currentConfig = TIMER_TYPES[currentType];
  const totalTime = currentConfig.duration * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    if (!currentSession) {
      const session: PomodoroSession = {
        id: Date.now().toString(),
        taskId: currentTaskId,
        startTime: Date.now(),
        duration: currentConfig.duration,
        type: currentType,
        completed: false
      };
      setCurrentSession(session);
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(currentConfig.duration * 60);
    setCurrentSession(null);
  };

  const completeSession = () => {
    if (currentSession) {
      const completedSession: PomodoroSession = {
        ...currentSession,
        endTime: Date.now(),
        completed: true
      };
      onSessionComplete(completedSession);
      
      if (currentType === 'work') {
        setCompletedSessions(prev => prev + 1);
        // Auto-switch to break after work session
        const nextType = completedSessions % 4 === 3 ? 'long-break' : 'short-break';
        switchTimerType(nextType);
      } else {
        // Auto-switch back to work after break
        switchTimerType('work');
      }
    }
    
    setIsRunning(false);
    setCurrentSession(null);
    
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Complete!', {
        body: `${currentConfig.label} session finished`,
        icon: '/favicon.ico'
      });
    }
  };

  const switchTimerType = (type: typeof currentType) => {
    setCurrentType(type);
    setTimeLeft(TIMER_TYPES[type].duration * 60);
    setIsRunning(false);
    setCurrentSession(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const IconComponent = currentConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-2xl p-6 w-full max-w-sm mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <IconComponent 
            className="h-5 w-5" 
            style={{ color: currentConfig.color }}
          />
          <h3 className="text-lg font-semibold">{currentConfig.label}</h3>
        </div>
        <div className="flex justify-center gap-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < completedSessions ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-6">
        <motion.div
          key={currentType}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          {/* Circular Progress */}
          <div className="relative w-48 h-48 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-muted opacity-20"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                stroke={currentConfig.color}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                animate={{ 
                  strokeDashoffset: 2 * Math.PI * 45 * (1 - progress / 100) 
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </svg>
            
            {/* Timer Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: isRunning ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
                className="text-center"
              >
                <div className="text-4xl font-bold font-mono">{formatTime(timeLeft)}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {Math.round(progress)}% complete
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3 mb-6">
        <Button
          onClick={isRunning ? pauseTimer : startTimer}
          size="lg"
          className="rounded-full w-16 h-16"
          style={{ backgroundColor: currentConfig.color }}
        >
          {isRunning ? (
            <Pause className="h-6 w-6 text-white" />
          ) : (
            <Play className="h-6 w-6 text-white ml-1" />
          )}
        </Button>
        
        <Button
          onClick={resetTimer}
          variant="outline"
          size="lg"
          className="rounded-full w-16 h-16"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>

      {/* Timer Type Selector */}
      <div className="flex gap-2 justify-center">
        {Object.entries(TIMER_TYPES).map(([type, config]) => (
          <Button
            key={type}
            variant={currentType === type ? "default" : "outline"}
            size="sm"
            onClick={() => switchTimerType(type as typeof currentType)}
            disabled={isRunning}
            className="rounded-full text-xs px-3"
            style={{
              backgroundColor: currentType === type ? config.color : undefined,
              borderColor: config.color,
              color: currentType === type ? 'white' : config.color
            }}
          >
            {config.label}
          </Button>
        ))}
      </div>

      {/* Session Info */}
      {currentTaskId && (
        <div className="mt-4 text-center">
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Focusing on current task
          </Badge>
        </div>
      )}
    </motion.div>
  );
};

export default PomodoroTimer;