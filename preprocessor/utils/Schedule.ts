import { Range } from 'node-schedule';
import lodash from 'lodash';
const { transform } = lodash;

import { InferType } from '@core/types/Infer';
import { InitTimeMap, NodeScheduleTimeMap, RecurrenceRule, ScheduleMap, ScheduledProcessors } from '@common/types/PreProcessor';


export const generateCycleMapForProcessors = (scheduleMap: ScheduleMap): { [task in ScheduledProcessors]: NodeScheduleTimeMap } => {
  return transform(
      Object.keys(scheduleMap),
      (acc, task) => {
      acc[task] = generateRecurrenceRuleMapForProcessor(scheduleMap[task]);
    },
    {} as { [task in ScheduledProcessors]: NodeScheduleTimeMap }
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

const generateRecurrenceRuleMapForProcessor = (initTimeMap: InitTimeMap): NodeScheduleTimeMap => {
  return {
    ...(initTimeMap?.month ? { month: generateSubRecurrenceRule(initTimeMap.month, defaultInitTimeMap.month) } : null),
    ...(initTimeMap?.dayOfMonth ? { date: generateSubRecurrenceRule(initTimeMap.dayOfMonth, defaultInitTimeMap.dayOfMonth) } : null),
    ...(initTimeMap?.dayOfWeek ? { dayOfWeek: generateSubRecurrenceRule(initTimeMap.dayOfWeek, defaultInitTimeMap.dayOfWeek) } : null),
    ...(initTimeMap?.hours ? { hour: generateSubRecurrenceRule(initTimeMap.hours, defaultInitTimeMap.hours) } : null),
    ...(initTimeMap?.minutes ? { minute: generateSubRecurrenceRule(initTimeMap.minutes, defaultInitTimeMap.minutes) } : null),
    ...(initTimeMap?.seconds ? { second: generateSubRecurrenceRule(initTimeMap.seconds, defaultInitTimeMap.seconds) } : null)
  }
};

const defaultInitTimeMap: { [rule in keyof InferType<InitTimeMap, 'REQUIRE ALL'>]: InferType<RecurrenceRule<1>, 'ENFORCE', 'step'> } = {
  month: { start: 0, end: 11, step: 1 },
  dayOfMonth: { start: 1, end: 28, step: 1 },
  dayOfWeek: { start: 1, end: 7, step: 1 },
  hours: { start: 0, end: 59, step: 1 },
  minutes: { start: 0, end: 59, step: 0 },
  seconds: { start: 0, end: 59, step: 1 }
}