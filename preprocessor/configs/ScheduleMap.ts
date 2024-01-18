import { CalculateStatsProcessor } from '@preprocessor/processors/CalculateStats.processor';
import { ScheduleMap } from '@common/types/PreProcessor';


export const scheduleMap: ScheduleMap = {
  calculateStats: {
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
    processor: new CalculateStatsProcessor()
  }
};