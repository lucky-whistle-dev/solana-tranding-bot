import { scheduleJob } from 'node-schedule';

import { generateCycleMapForTasks } from '@preprocessor/utils/Schedule';
import { scheduleMap } from '@preprocessor/configs/ScheduleMap';
import { ScheduledTasks } from '@preprocessor/types/ScheduledPreprocess';


export class ScheduledPreprocessProvider {
  private cycleMap = generateCycleMapForTasks(scheduleMap)
  constructor() {}

  async start() {
    for (const task of Object.keys(this.cycleMap)) {
      scheduleJob(this.cycleMap[task], async () => await scheduleMap[task as ScheduledTasks].processor.run());
    }
  }
}