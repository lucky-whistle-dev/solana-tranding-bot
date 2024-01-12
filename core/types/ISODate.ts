type ZeroThroughNine = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type Block60 = `${number}${number}`;

type ApplicableYearFormat = `${0 | 1}${ZeroThroughNine}${ZeroThroughNine}${ZeroThroughNine}` | `${20}${0 | 1 | 2}${ZeroThroughNine}`;

type ApplicableMonthFormat = `${0 | 1}${number}`;
type ApplicableDayFormat = `${0 | 1 | 2 | 3}${number}`;

type YearsThroughDays = `${ApplicableYearFormat}-${ApplicableMonthFormat}-${ApplicableDayFormat}`;
export type MillisecondsFormat = `.${number}${number}${number}`;

type HoursThroughSeconds<MS extends MillisecondsFormat = undefined> = 
  MS extends undefined 
  ? `${Block60}:${Block60}:${Block60}`
  : `${Block60}:${Block60}:${Block60}.${number}${number}${number}`;

type Separator = 'T'; 
type Timezone = 'Z';

export type ISODateString<MS extends MillisecondsFormat = undefined> = `${YearsThroughDays}${Separator}${HoursThroughSeconds<MS>}${Timezone}`;