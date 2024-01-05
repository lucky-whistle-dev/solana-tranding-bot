import { Request, Response, NextFunction } from 'express';
import { LogProvider } from '@core/providers/LogProvider';
import { BaseRoute } from '@core/baseServer/core/BaseRoute';

import { routeMappings } from '@core/baseServer/configs/RouteMappings';


/*
  Basic Health Check endpoint
  |
  ---> return response if alive
*/


const NAME = 'Poll Route'

export class PollRoute extends BaseRoute {
  name = NAME;
  
  private log: LogProvider = new LogProvider(NAME);
  
  constructor(rootpath: string) {
    super(rootpath);
    this.router.get(routeMappings.poll.subRouteMappings.root.name, this.poll.bind(this));
  }

  private poll(req: Request, res: Response, next: NextFunction) {
    this.log.custom(routeMappings.poll.subRouteMappings.root.customConsoleMessages[0], true);
    res.status(200).send({ alive: 'okay' });
  }

  validateRoute = async (req: Request, res: Response, next: NextFunction): Promise<boolean> => true;
  performRouteAction = async (opts, req: Request, res: Response, next: NextFunction): Promise<void> => null;
}