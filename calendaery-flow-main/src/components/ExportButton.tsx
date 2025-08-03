import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Task } from '@/types';

interface ExportButtonProps {
  tasks: Task[];
}

const ExportButton = ({ tasks }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const exportTasks = () => {
    setIsExporting(true);
    
    // Create export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.completed).length,
      pendingTasks: tasks.filter(t => !t.completed).length,
      tasks: tasks.map(task => ({
        text: task.text,
        completed: task.completed,
        date: task.date,
        createdAt: new Date(task.createdAt).toLocaleString(),
        completedAt: task.completedAt ? new Date(task.completedAt).toLocaleString() : null
      }))
    };

    // Create text version
    const textContent = `
Calendaery Task Export
Generated: ${new Date().toLocaleString()}

Summary:
- Total Tasks: ${exportData.totalTasks}
- Completed: ${exportData.completedTasks}
- Pending: ${exportData.pendingTasks}

Tasks:
${tasks.map(task => `
${task.completed ? '✅' : '⏳'} ${task.text}
   Created: ${new Date(task.createdAt).toLocaleString()}
   ${task.date ? `Date: ${new Date(task.date).toLocaleDateString()}` : 'No specific date'}
   ${task.completedAt ? `Completed: ${new Date(task.completedAt).toLocaleString()}` : ''}
`).join('\n')}
    `.trim();

    // Download JSON
    const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement('a');
    jsonLink.href = jsonUrl;
    jsonLink.download = `calendaery-tasks-${new Date().toISOString().split('T')[0]}.json`;
    jsonLink.click();
    URL.revokeObjectURL(jsonUrl);

    // Download Text
    const textBlob = new Blob([textContent], { type: 'text/plain' });
    const textUrl = URL.createObjectURL(textBlob);
    const textLink = document.createElement('a');
    textLink.href = textUrl;
    textLink.download = `calendaery-tasks-${new Date().toISOString().split('T')[0]}.txt`;
    textLink.click();
    URL.revokeObjectURL(textUrl);

    // UI feedback
    setTimeout(() => {
      setIsExporting(false);
      setExported(true);
      setTimeout(() => setExported(false), 2000);
    }, 500);
  };

  if (tasks.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Button
        onClick={exportTasks}
        disabled={isExporting}
        size="sm"
        variant="outline"
        className="glass glass-hover"
      >
        <motion.div
          animate={isExporting ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="mr-2"
        >
          {exported ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </motion.div>
        {exported ? 'Exported!' : isExporting ? 'Exporting...' : 'Export Tasks'}
      </Button>
    </motion.div>
  );
};

export default ExportButton;