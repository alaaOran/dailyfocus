import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Calendar as CalendarIcon, Clock, Search, Filter, AlertCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import TaskItem from './TaskItem';
import { Task, TaskCategory, TaskPriority } from '@/types';

const defaultCategories: TaskCategory[] = [
  { id: '1', name: 'Work', color: '#EF4444', icon: 'briefcase' },
  { id: '2', name: 'Personal', color: '#10B981', icon: 'heart' },
  { id: '3', name: 'Home', color: '#3B82F6', icon: 'home' },
];

interface TodoListProps {
  selectedDate: Date | null;
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  categories: TaskCategory[];
  onCategoriesChange: (categories: TaskCategory[]) => void;
  selectedCategory?: string;
}

const TodoList = ({ selectedDate, tasks, onTasksChange, categories, onCategoriesChange, selectedCategory }: TodoListProps) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState<string>(categories[0]?.id || '');
  const [newTaskTime, setNewTaskTime] = useState<number | undefined>();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(true);

  // Initialize categories if empty
  useEffect(() => {
    if (categories.length === 0) {
      onCategoriesChange(defaultCategories);
    }
  }, [categories.length, onCategoriesChange]);

  // Filter tasks based on selected date, category, search, and priority
  const getFilteredTasks = () => {
    let filteredTasks = tasks;

    // Filter by date
    if (selectedDate) {
      const selectedDateKey = selectedDate.toISOString().split('T')[0];
      filteredTasks = filteredTasks.filter(task => task.date === selectedDateKey);
    }

    // Filter by category
    if (selectedCategory) {
      filteredTasks = filteredTasks.filter(task => task.category.id === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.text.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query)) ||
        task.category.name.toLowerCase().includes(query) ||
        task.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }

    // Filter by completion status
    if (!showCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.completed);
    }

    return filteredTasks.sort((a, b) => {
      // Sort by completed status first (incomplete first)
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // Then by priority
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      // Finally by creation date (newest first)
      return b.createdAt - a.createdAt;
    });
  };

  const addTask = () => {
    if (!newTaskText.trim() || !newTaskCategory) return;
    
    const selectedCategoryData = categories.find(c => c.id === newTaskCategory) || categories[0];
    
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      description: newTaskDescription.trim() || undefined,
      completed: false,
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : undefined,
      createdAt: Date.now(),
      category: selectedCategoryData,
      priority: newTaskPriority,
      estimatedTime: newTaskTime,
      tags: []
    };
    
    onTasksChange([...tasks, newTask]);
    setNewTaskText('');
    setNewTaskDescription('');
    setNewTaskPriority('medium');
    setNewTaskCategory(categories[0]?.id || '');
    setNewTaskTime(undefined);
    setShowAddForm(false);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId 
        ? { ...task, ...updates, completedAt: updates.completed ? Date.now() : undefined }
        : task
    );
    onTasksChange(updatedTasks);
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    onTasksChange(updatedTasks);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const filteredTasks = getFilteredTasks();
    const reorderedTasks = Array.from(filteredTasks);
    const [removed] = reorderedTasks.splice(result.source.index, 1);
    reorderedTasks.splice(result.destination.index, 0, removed);
    
    // Update the order by modifying createdAt timestamps
    const reorderedWithTimestamps = reorderedTasks.map((task, index) => ({
      ...task,
      createdAt: Date.now() - (index * 1000)
    }));
    
    // Merge with other tasks not in the current filter
    const otherTasks = tasks.filter(task => 
      selectedDate 
        ? task.date !== selectedDate.toISOString().split('T')[0]
        : task.date !== undefined
    );
    
    onTasksChange([...otherTasks, ...reorderedWithTimestamps]);
  };

  const getCompletionProgress = () => {
    const filteredTasks = getFilteredTasks();
    if (filteredTasks.length === 0) return 0;
    const completedCount = filteredTasks.filter(task => task.completed).length;
    return Math.round((completedCount / filteredTasks.length) * 100);
  };

  const filteredTasks = getFilteredTasks();
  const progress = getCompletionProgress();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTask();
    } else if (e.key === 'Escape') {
      setShowAddForm(false);
      setNewTaskText('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="glass rounded-lg p-3 w-full shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <h2 className="text-base font-bold text-foreground">
            {selectedDate ? 'Daily Tasks' : 'All Tasks'}
          </h2>
          {selectedDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <CalendarIcon className="h-3 w-3" />
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          )}
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          size="sm"
          className="gradient-primary text-white hover:scale-110 transition-transform duration-200 rounded-lg shadow-lg"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Progress Bar */}
      {filteredTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-3 p-2 glass rounded-lg"
        >
          <div className="flex items-center justify-between text-xs font-medium text-foreground mb-1">
            <span>Task Progress</span>
            <span className="text-primary font-bold">{progress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full gradient-primary rounded-full shadow-sm"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <span>{filteredTasks.filter(t => t.completed).length} completed</span>
            <span>{filteredTasks.length} total</span>
          </div>
        </motion.div>
      )}

      {/* Search and Filters */}
      <div className="mb-3 space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="pl-8 border-0 bg-glass-hover/50 rounded-lg text-sm"
            />
          </div>
          <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
            <SelectTrigger className="w-28 border-0 bg-glass-hover/50 rounded-lg text-sm">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Show Completed Toggle */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="rounded border-glass-border"
            />
            Show completed tasks
          </label>
        </div>
      </div>

      {/* Add Task Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-3 p-2 glass rounded-lg border border-glass-border/50"
          >
            <div className="space-y-2">
              <div>
                <Input
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="What needs to be done?"
                  className="border-0 bg-glass-hover/50 rounded-lg text-sm"
                  autoFocus
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Select value={newTaskCategory} onValueChange={setNewTaskCategory}>
                  <SelectTrigger className="border-0 bg-glass-hover/50 rounded-lg text-sm">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={newTaskPriority} onValueChange={(value: any) => setNewTaskPriority(value)}>
                  <SelectTrigger className="border-0 bg-glass-hover/50 rounded-lg text-sm">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={addTask}
                  disabled={!newTaskText.trim()}
                  className="flex-1 gradient-primary text-white rounded-lg text-sm"
                >
                  Add Task
                </Button>
                <Button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTaskText('');
                  }}
                  variant="ghost"
                  className="rounded-lg text-sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-muted-foreground"
          >
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {selectedDate ? 'No tasks for this day' : 'No tasks yet'}
            </p>
            <p className="text-xs mt-1">
              Click the + button to add your first task
            </p>
          </motion.div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  <AnimatePresence>
                    {filteredTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                              className={`
                                ${snapshot.isDragging ? 'rotate-3 scale-105 shadow-xl' : ''}
                                transition-all duration-200
                              `}
                            >
                            <TaskItem
                              task={task}
                              onUpdate={updateTask}
                              onDelete={deleteTask}
                              isDragging={snapshot.isDragging}
                            />
                            </motion.div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </AnimatePresence>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Task Summary */}
      {filteredTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 pt-4 border-t border-glass-border"
        >
          <div className="flex gap-2 text-xs">
            <Badge variant="outline" className="text-muted-foreground">
              {filteredTasks.filter(t => !t.completed).length} pending
            </Badge>
            <Badge variant="outline" className="text-success">
              {filteredTasks.filter(t => t.completed).length} completed
            </Badge>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TodoList;