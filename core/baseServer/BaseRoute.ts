import { Response, Router, Request, NextFunction } from 'express';
import { join } from 'path';


/*
  All routes need to extend this class
*/


export abstract class BaseRoute {
  protected _router: Router;

  constructor(protected _rootpath: string) { this._router = Router(); }

  get router() { return this._router };
  get rootpath() { return this._rootpath; }

  protected mergeBaseRoutePath = (prefix: string, suffix: string) => join(prefix, suffix);

  protected async pipeRequest(opts: RouteOpts, req: Request, res: Response, next: NextFunction, params: any): Promise<boolean> {
    const validated = await this.validateRoute(req, res, next);
    if (validated) { 
      await this.performRouteAction(opts, req, res, next, params);
      return true;
    } else {
      res.status(403).send({ err: 'unauthorized on route' });
      return false;
    }
  }

  abstract validateRoute(req: Request, res: Response, next: NextFunction): Promise<boolean>;
  abstract performRouteAction(opts: RouteOpts, req: Request, res: Response, next: NextFunction, params: any): Promise<void>;
}


export interface RouteOpts {
  method: string;
  customMsg: any;
}