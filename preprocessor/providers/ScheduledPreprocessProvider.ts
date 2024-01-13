import { scheduleJob } from 'node-schedule';

import { generateCycleMapForTasks } from '@preprocessor/utils/Schedule';
import { scheduleMap } from '@preprocessor/configs/ScheduleMap';
import { ScheduledTasks } from '@preprocessor/types/ScheduledPreprocess';
import { LogProvider } from '@core/providers/LogProvider';


export class ScheduledPreprocessProvider {
  private zLog: LogProvider = new LogProvider(ScheduledPreprocessProvider.name);

  constructor(private cycleMap = generateCycleMapForTasks(scheduleMap)) {}

  async start() {
    for (const task of Object.keys(this.cycleMap)) {
      scheduleJob(this.cycleMap[task], async () => {
        try {
          this.zLog.debug(`scheduling task of type ${task}`);
          await scheduleMap[task as ScheduledTasks].processor.run()
        } catch (err) {
          this.zLog.error(`error scheduling task ${task} with error: ${err}`);
          throw err;
        }
      });
    }
  }
}