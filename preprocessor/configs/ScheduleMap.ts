import { CalculateEMAProcessor } from '@preprocessor/processors/CalculateEMA.processor';
import { ScheduleMap } from '@preprocessor/types/PreProcessor';


export const scheduleMap: ScheduleMap = {
  calculateEMA: {
    timeMap: {
      hours: {
        start: 0,
        end: 23,
        step: 1
      },
      minutes: { 
        start: 0,
        end: 59,
        step: 2
      },
      seconds: 0
    },
    processor: new CalculateEMAProcessor()
  }
};