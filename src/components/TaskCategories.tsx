import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Briefcase, Heart, Home, Target, Book, Dumbbell, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TaskCategory } from '@/types';

interface TaskCategoriesProps {
  categories: TaskCategory[];
  onCategoriesChange: (categories: TaskCategory[]) => void;
  selectedCategory?: string;
  onCategorySelect: (categoryId: string | undefined) => void;
}

// Predefined simple categories
const defaultCategories: TaskCategory[] = [
  { id: 'work', name: 'Work', color: '#EF4444', icon: 'briefcase' },
  { id: 'personal', name: 'Personal', color: '#10B981', icon: 'heart' },
  { id: 'home', name: 'Home', color: '#3B82F6', icon: 'home' },
  { id: 'health', name: 'Health', color: '#F59E0B', icon: 'dumbbell' },
  { id: 'learning', name: 'Learning', color: '#8B5CF6', icon: 'book' },
];

const iconOptions = [
  { icon: Briefcase, name: 'briefcase' },
  { icon: Heart, name: 'heart' },
  { icon: Home, name: 'home' },
  { icon: Target, name: 'target' },
  { icon: Book, name: 'book' },
  { icon: Dumbbell, name: 'dumbbell' },
  { icon: Palette, name: 'palette' }
];

const colorOptions = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899',
  '#06B6D4', '#84CC16', '#F97316', '#A855F7', '#14B8A6', '#F43F5E'
];

const TaskCategories = ({ categories, onCategoriesChange, selectedCategory, onCategorySelect }: TaskCategoriesProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TaskCategory | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: colorOptions[0],
    icon: 'briefcase'
  });

  // Initialize with default categories if empty
  if (categories.length === 0) {
    onCategoriesChange(defaultCategories);
    return null;
  }

  const addCategory = () => {
    if (!newCategory.name.trim()) return;
    
    const category: TaskCategory = {
      id: Date.now().toString(),
      name: newCategory.name.trim(),
      color: newCategory.color,
      icon: newCategory.icon
    };
    
    onCategoriesChange([...categories, category]);
    setNewCategory({ name: '', color: colorOptions[0], icon: 'briefcase' });
    setShowAddForm(false);
  };

  const updateCategory = (category: TaskCategory) => {
    onCategoriesChange(categories.map(c => c.id === category.id ? category : c));
    setEditingCategory(null);
  };

  const deleteCategory = (categoryId: string) => {
    // Don't allow deleting default categories
    if (defaultCategories.find(c => c.id === categoryId)) return;
    
    onCategoriesChange(categories.filter(c => c.id !== categoryId));
    if (selectedCategory === categoryId) {
      onCategorySelect(undefined);
    }
  };

  const getIcon = (iconName: string) => {
    const iconData = iconOptions.find(opt => opt.name === iconName);
    return iconData ? iconData.icon : Briefcase;
  };

  return (
    <div className="w-full">
      {/* Simple Category Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Filter by Category</h3>
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategorySelect(undefined)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${selectedCategory === undefined
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-glass-hover/50 text-foreground hover:bg-glass-hover hover:shadow-sm'
              }
            `}
          >
            All Tasks
          </motion.button>
          
          {categories.map((category) => {
            const IconComponent = getIcon(category.icon);
            return (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onCategorySelect(category.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-glass-hover/50 text-foreground hover:bg-glass-hover hover:shadow-sm'
                  }
                `}
              >
                <IconComponent className="h-4 w-4" style={{ color: category.color }} />
                {category.name}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Add Category Button - Only show if user wants to add custom categories */}
      <div className="text-center">
        <Button
          onClick={() => setShowAddForm(true)}
          variant="outline"
          size="sm"
          className="rounded-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Category
        </Button>
      </div>

      {/* Add Category Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 glass rounded-xl border border-glass-border/50"
          >
            <div className="space-y-4">
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Category name"
                className="border-0 bg-glass-hover/50 rounded-xl"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Icon:</p>
                  <div className="flex gap-2 flex-wrap">
                    {iconOptions.map((option) => (
                      <Button
                        key={option.name}
                        variant={newCategory.icon === option.name ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNewCategory({ ...newCategory, icon: option.name })}
                        className="rounded-xl p-2"
                      >
                        <option.icon className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Color:</p>
                  <div className="flex gap-2 flex-wrap">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewCategory({ ...newCategory, color })}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          newCategory.color === color ? 'border-foreground scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        title={`Select ${color} color`}
                        aria-label={`Select ${color} color`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={addCategory}
                  disabled={!newCategory.name.trim()}
                  className="flex-1 gradient-primary text-white rounded-xl"
                >
                  Add Category
                </Button>
                <Button
                  onClick={() => setShowAddForm(false)}
                  variant="ghost"
                  className="rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskCategories;