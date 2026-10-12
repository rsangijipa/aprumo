import { TaskDef, ActiveTaskState, CompletedStats } from '../types';

export class GoalSystem {
  public static calculateProgress(
    taskDefs: TaskDef[],
    activeTasks: Map<string, ActiveTaskState>
  ): {
    totalTasks: number;
    completedTasks: number;
    essentialTotal: number;
    essentialCompleted: number;
    allEssentialDone: boolean;
    percentage: number;
  } {
    let totalTasks = 0;
    let completedTasks = 0;
    let essentialTotal = 0;
    let essentialCompleted = 0;

    taskDefs.forEach(def => {
      totalTasks++;
      const state = activeTasks.get(def.id);
      const isDone = state ? state.isCompleted : false;

      if (isDone) completedTasks++;
      if (def.isEssential) {
        essentialTotal++;
        if (isDone) essentialCompleted++;
      }
    });

    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const allEssentialDone = essentialTotal > 0 && essentialCompleted >= essentialTotal;

    return {
      totalTasks,
      completedTasks,
      essentialTotal,
      essentialCompleted,
      allEssentialDone,
      percentage
    };
  }

  public static buildSummaryStats(
    parkName: string,
    taskDefs: TaskDef[],
    activeTasks: Map<string, ActiveTaskState>,
    helpsGiven: number,
    eventsHandled: number,
    elapsedSeconds: number
  ): CompletedStats {
    const progress = this.calculateProgress(taskDefs, activeTasks);
    return {
      parkName,
      tasksCompleted: progress.completedTasks,
      essentialTasksCompleted: progress.essentialCompleted,
      totalEssentialTasks: progress.essentialTotal,
      helpsGiven,
      eventsHandled,
      timeSpentSeconds: Math.round(elapsedSeconds),
      isCompleteVictory: progress.allEssentialDone
    };
  }
}
