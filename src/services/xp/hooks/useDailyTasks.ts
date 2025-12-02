import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { xpService } from '../api';
import { DailyTask, DailyTaskType } from '../types';

interface UseDailyTasksReturn {
  tasks: DailyTask[];
  allCompleted: boolean;
  bonusXp: number;
  bonusClaimed: boolean;
  completedCount: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  completeTask: (taskType: DailyTaskType) => Promise<{
    xpGranted: number;
    allTasksCompleted: boolean;
    bonusGranted: number;
  } | null>;
}

export function useDailyTasks(): UseDailyTasksReturn {
  const { ready, authenticated } = usePrivy();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [allCompleted, setAllCompleted] = useState(false);
  const [bonusXp, setBonusXp] = useState(15);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDailyTasks = useCallback(async () => {
    if (!ready || !authenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await xpService.getDailyTasks();
      setTasks(data.tasks);
      setAllCompleted(data.allCompleted);
      setBonusXp(data.bonusXp);
      setBonusClaimed(data.bonusClaimed);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch daily tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [ready, authenticated]);

  // Initial load
  useEffect(() => {
    if (ready && authenticated) {
      fetchDailyTasks();
    } else {
      setTasks([]);
      setAllCompleted(false);
      setBonusClaimed(false);
    }
  }, [ready, authenticated, fetchDailyTasks]);

  const completeTask = useCallback(async (taskType: DailyTaskType) => {
    if (!ready || !authenticated) return null;

    try {
      const result = await xpService.completeDailyTask(taskType);
      // Refetch to get updated state
      await fetchDailyTasks();
      return result;
    } catch (err) {
      console.error('Failed to complete daily task:', err);
      return null;
    }
  }, [ready, authenticated, fetchDailyTasks]);

  const completedCount = tasks.filter(t => t.completed).length;

  return {
    tasks,
    allCompleted,
    bonusXp,
    bonusClaimed,
    completedCount,
    isLoading,
    error,
    refetch: fetchDailyTasks,
    completeTask,
  };
}

