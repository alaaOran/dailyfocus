import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Edit2, Trash2, GripVertical, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types';

interface TaskItemProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  isDragging?: boolean;
}

const TaskItem = ({ task, onUpdate, onDelete, isDragging }: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onUpdate(task.id, { text: editText.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditText(task.text);
      setIsEditing(false);
    }
  };

  const toggleComplete = () => {
    onUpdate(task.id, { completed: !task.completed });
  };

  return (
    <motion.div
      layout
      className={`
        glass p-3 rounded-lg group hover:shadow-lg transition-all duration-200
        ${isDragging ? 'bg-primary/5 border-primary/20' : ''}
        ${task.completed ? 'opacity-70' : ''}
      `}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <div className="cursor-grab active:cursor-grabbing text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Checkbox */}
        <div className="flex-shrink-0">
          <Checkbox
            checked={task.completed}
            onCheckedChange={toggleComplete}
            className="data-[state=checked]:bg-success data-[state=checked]:border-success"
          />
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleSaveEdit}
              className="border-0 bg-transparent p-0 h-auto focus:ring-0 focus:outline-none text-sm"
              autoFocus
            />
          ) : (
            <div className="flex flex-col">
              <span
                className={`
                  text-sm font-medium break-words cursor-pointer
                  ${task.completed 
                    ? 'line-through text-muted-foreground' 
                    : 'text-foreground'
                  }
                `}
                onClick={() => setIsEditing(true)}
              >
                {task.text}
              </span>
              {task.completedAt && (
                <span className="text-xs text-success mt-1">
                  Completed {new Date(task.completedAt).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {!isEditing && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-7 w-7 p-0 hover:bg-accent"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Task Metadata */}
      {task.date && (
        <div className="mt-2 text-xs text-muted-foreground pl-7">
          📅 {new Date(task.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      )}
    </motion.div>
  );
};

export default TaskItem;