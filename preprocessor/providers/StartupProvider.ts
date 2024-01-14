import { LogProvider } from '@core/providers/LogProvider';
import { generateCycleMapForProcessors } from '@preprocessor/utils/Schedule';
import { ScheduledProcessors } from '@preprocessor/types/PreProcessor';
import { scheduleMap } from '@preprocessor/configs/ScheduleMap';


export class StartupProvider {
  private zLog: LogProvider = new LogProvider(StartupProvider.name);

  constructor(private cycleMap = generateCycleMapForProcessors(scheduleMap)) {}

  async start() {
    for (const processor of Object.keys(this.cycleMap)) {
      try {
        this.zLog.debug(`running processor startup of type ${processor}`);
        await scheduleMap[processor as ScheduledProcessors].processor.onStartup();
      } catch (err) {
        this.zLog.error(`error running processor startup for processor ${processor} with error: ${err}`);
        throw err;
      }
    }
  }
}