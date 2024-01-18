import { scheduleJob } from 'node-schedule';

import { LogProvider } from '@core/providers/LogProvider';
import { ScheduledProcessors } from '@common/types/PreProcessor';
import { generateCycleMapForProcessors } from '@preprocessor/utils/Schedule';
import { scheduleMap } from '@preprocessor/configs/ScheduleMap';


export class ProcessorSchedulerProvider {
  private zLog: LogProvider = new LogProvider(ProcessorSchedulerProvider.name);

  constructor(private cycleMap = generateCycleMapForProcessors(scheduleMap)) {}

  async start() {
    for (const processor of Object.keys(this.cycleMap)) {
      scheduleJob(this.cycleMap[processor], async () => {
        try {
          this.zLog.debug(`scheduling processor of type ${processor}`);
          await scheduleMap[processor as ScheduledProcessors].processor.run()
        } catch (err) {
          this.zLog.error(`error scheduling processor ${processor} with error: ${err}`);
          throw err;
        }
      });
    }
  }
}