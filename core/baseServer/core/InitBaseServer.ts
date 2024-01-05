import { BaseServer } from '@core/baseServer/core/BaseServer';


/*
  BaseServer is built to be extended

  Add a socket server on top? 
  Add additional providers?

  Up to you
*/
export class InitBaseServer extends BaseServer {
  initService = async (): Promise<boolean> => true;
  startEventListeners = async (): Promise<void> => null;
}