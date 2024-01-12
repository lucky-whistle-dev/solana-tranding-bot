import chalk from 'chalk';


export const BASE = chalk.bold.white;
export const ERROR = chalk.bold.red;
export const WARN = chalk.yellow;
export const INFO = chalk.blue;
export const DEBUG = chalk.grey;
export const ROUTE = chalk.bold.grey;
export const STATUSOK = chalk.bold.greenBright;
export const STATUSERROR = chalk.bold.redBright;

export const TIMER = chalk.greenBright;

export interface CustomMessagePayload<T> {
  text: string;
  color: T;
}

export type CustomMessage<T> = { [ K in keyof T ]: T[K] };

export type CustomMessageWrap = CustomMessage<{ [key: number]: CustomMessagePayload<Function> }>;

export type Message = any;