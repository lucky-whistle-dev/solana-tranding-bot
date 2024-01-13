import { Range } from 'node-schedule';
import lodash from 'lodash';
const { transform } = lodash;

import { InitTimeMap, NodeScheduleTimeMap, RecurrenceRule, ScheduleMap, ScheduledTasks } from '@preprocessor/types/ScheduledPreprocess';


export const generateCycleMapForTasks = (scheduleMap: ScheduleMap): { [task in ScheduledTasks]: NodeScheduleTimeMap } => {
  return transform(
      Object.keys(scheduleMap),
      (acc, task) => {
      acc[task] = generateRecurrenceRuleMapForTask(scheduleMap[task]);
    },
    {} as { [task in ScheduledTasks]: NodeScheduleTimeMap }
  );
};

const generateSubRecurrenceRule = (subRule: RecurrenceRule, defaults: { start: number, end: number, step: number }): number | Range => {
  if (typeof subRule === 'number') return subRule;
  return new Range(
    'start' in subRule ? subRule.start : defaults.start,
    'end' in subRule ? subRule.end : defaults.end,
    subRule?.step != null ? subRule.step : defaults.step
  );
};

const generateRecurrenceRuleMapForTask = (initTimeMap: InitTimeMap): NodeScheduleTimeMap => {
  return {
    ...(initTimeMap?.month != null ? { month: generateSubRecurrenceRule(initTimeMap.month, defaultInitTimeMap.month) } : null),
    ...(initTimeMap?.dayOfMonth != null ? { date: generateSubRecurrenceRule(initTimeMap.dayOfMonth, defaultInitTimeMap.dayOfMonth) } : null),
    ...(initTimeMap?.dayOfWeek != null ? { dayOfWeek: generateSubRecurrenceRule(initTimeMap.dayOfWeek, defaultInitTimeMap.dayOfWeek) } : null),
    ...(initTimeMap?.hours != null ? { hour: generateSubRecurrenceRule(initTimeMap.hours, defaultInitTimeMap.hours) } : null),
    ...(initTimeMap?.minutes != null ? { minute: generateSubRecurrenceRule(initTimeMap.minutes, defaultInitTimeMap.minutes) } : null),
    ...(initTimeMap?.seconds != null ? { second: generateSubRecurrenceRule(initTimeMap.seconds, defaultInitTimeMap.seconds) } : null)
  }
};

const defaultInitTimeMap: { [rule in keyof Required<InitTimeMap>]: Required<RecurrenceRule<1>> } = {
  month: { start: 0, end: 11, step: 1 },
  dayOfMonth: { start: 1, end: 28, step: 1 },
  dayOfWeek: { start: 1, end: 7, step: 1 },
  hours: { start: 0, end: 59, step: 1 },
  minutes: { start: 0, end: 59, step: 0 },
  seconds: { start: 0, end: 59, step: 1 }
}