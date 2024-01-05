import { BASE, STATUSOK, CustomMessageWrap } from '@core/models/ILog';


export interface IIndividualTimerMap {
  start: Date;
  stop: Date;
  elapsedInMs: number;
}

export type TimerMap<T> = {
  [ K in keyof T ]: T[K] 
}

export interface ITimerMap {
  baseName: string;
  timerMap: TimerMap<Record<string, IIndividualTimerMap>>;
}

export function elapsedTimeInMs(start: Date, stop: Date): number {
  return stop.getTime() - start.getTime();
}

export function customTimerMessage(message: string): CustomMessageWrap {
  return {
    1: {
      text: '[INITIALIZE] =>',
      color: STATUSOK
    },
    2: {
      text: message,
      color: BASE
    }
  }
}