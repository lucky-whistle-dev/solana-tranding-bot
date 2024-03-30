type Block60 = `${number}${number}`;

type ApplicableYearFormat = `${0 | 1 | 2}0${number}${number}`;

type ApplicableMonthFormat = `${0 | 1}${number}`;
type ApplicableDayFormat = `${0 | 1 | 2 | 3}${number}`;

type YearsThroughDays = `${ApplicableYearFormat}-${ApplicableMonthFormat}-${ApplicableDayFormat}`;
export type MillisecondsFormat = `${number}${number}${number}`;

type HoursThroughSeconds<MS extends MillisecondsFormat = undefined> = 
  MS extends undefined 
  ? `${Block60}:${Block60}:${Block60}`
  : `${Block60}:${Block60}:${Block60}.${MS}`;

type Separator = 'T'; 
type Timezone = string;

export type ISODateString<MS extends MillisecondsFormat = undefined> = `${YearsThroughDays}${Separator}${HoursThroughSeconds<MS>}${Timezone}`;

