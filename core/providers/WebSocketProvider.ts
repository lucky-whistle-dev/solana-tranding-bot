import { EventEmitter } from 'events';
import WebSocket from 'websocket';

import { LogProvider } from '@core/providers/LogProvider';
import { WebSocketOpts } from '@core/types/WebSocket';


export class WebSocketProvider extends EventEmitter {  
  constructor(protected opts: WebSocketOpts, protected zLog: LogProvider) { super(); }

  on = <EVT extends string, V>(event: EVT, listener: (data: V) => void) => super.on(event, listener);

  protected startListener<EVT extends string, U, V = undefined>(event: EVT, request?: V) {
    const wsClient = new WebSocket.client();

    wsClient.on('connectFailed', err => { 
      this.zLog.error(err);
      process.exit(1);
    });
    
    wsClient.on('connect', conn => {
      this.zLog.info(`connection opened on websocket for: ${this.opts.endpoint}`);
      
      conn.on('message', message => { 
        if (message.type === 'utf8') {
          const utf8msgData = (message as WebSocket.IUtf8Message).utf8Data;
          super.emit(event, JSON.parse(utf8msgData) as U);
        }

        if (message.type === 'binary') {
          const binaryData = (message as WebSocket.IBinaryMessage).binaryData;
          super.emit(event, JSON.parse(binaryData.toString()) as U);
        }
      });

      conn.on('error', err => this.zLog.error(`error on websocket: ${err}`));
      conn.on('close', () => this.zLog.info(`connection closed on websocket for: ${this.opts.endpoint}`));

      if (request) conn.send(JSON.stringify(request));
    });

    this.zLog.info(`connecting to: ${this.opts.endpoint}`);
    wsClient.connect(this.opts.endpoint, this.opts?.requestedProtocols, this.opts?.origin);
  }
}