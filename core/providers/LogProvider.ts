import { CustomMessageWrap, Message, BASE, ERROR, WARN, INFO, DEBUG, TIMER, STATUSOK } from '@core/types/Log';


export class LogProvider {
  private log = console.log;
  private table = console.table;
  
  constructor(private baseName: string) {}

  debug = (message: Message) => this.log(BASE(this.formatBaseName()), DEBUG(message));
  info = (message: Message) => this.log(BASE(this.formatBaseName()), INFO(message));
  warn = (message: Message) => this.log(BASE(this.formatBaseName()), WARN(message));
  error = (message: Message) => this.log(BASE(this.formatBaseName()), ERROR(message));
  logTable = (data: any, fields?: string[]) => this.table(data, fields);
  newLine = () => this.log();

  success = (message: Message) => {
    this.log(BASE(this.formatBaseName()), INFO(message), STATUSOK('[SUCCESS]'));
  }

  timer(elapsedTime: number) {
    this.log(
      BASE(this.formatBaseName()), 
      TIMER(`${new Date().toUTCString()} =>`),
      INFO(`Time Elapsed In Milliseconds: ${TIMER(elapsedTime)}`)
    );
  }
  
  boolean(bool: boolean) {
    bool 
    ? this.log(BASE(this.formatBaseName()), STATUSOK(bool)) 
    : this.log(BASE(this.formatBaseName()), ERROR(false));
  }

  custom(message: CustomMessageWrap, newLine?: boolean) {
    const finalMessage: string = Object.keys(message)
      .map(key => message[key].color(message[key].text))
      .join(' ');

    if (newLine) this.log();
    this.log(BASE(this.formatBaseName()), finalMessage);
  }

  json(json: any) {
    const stringifiedJson = Object.keys(json).map(key => [ INFO(`{ ${key}: ${BASE(json[key])} }`), ])
      .join('');

    this.log(stringifiedJson);
  }

  private formatBaseName = (): string => `[${this.baseName.toUpperCase()}]: `;
}