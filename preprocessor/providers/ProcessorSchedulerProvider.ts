import { scheduleJob } from 'node-schedule';

import { LogProvider } from '@core/providers/LogProvider';
import { generateCycleMapForProcessors } from '@preprocessor/utils/Schedule';
import { ScheduledProcessors } from '@preprocessor/types/PreProcessor';
import { scheduleMap } from '@preprocessor/configs/ScheduleMap';


export class ProcessorSchedulerProvider {
  private zLog: LogProvider = new LogProvider(ProcessorSchedulerProvider.name);

  constructor(private cycleMap = generateCycleMapForProcessors(scheduleMap)) {}

  async start() {
    for (const task of Object.keys(this.cycleMap)) {
      scheduleJob(this.cycleMap[task], async () => {
        try {
          this.zLog.debug(`scheduling task of type ${task}`);
          await scheduleMap[task as ScheduledProcessors].processor.run()
        } catch (err) {
          this.zLog.error(`error scheduling task ${task} with error: ${err}`);
          throw err;
        }
      });
    }
  }
}