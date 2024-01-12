import { ROUTE, STATUSOK, INFO } from '@core/types/Log';
import { BaseRoute } from '@core/baseServer/core/types/RouteMappings';


/*
  Global Route Mapping

  Single Source of truth for all routes, with all subRoutes and custom Logs defined here

  Can have multiple routeMappings per project

  Base project will always have a poll route for health checks
*/


type GlobalPollRoute = 'poll';
type GlobalPollRouteSubRoutes = 'root';

export const routeMappings: { [route in GlobalPollRoute]: BaseRoute<route, GlobalPollRouteSubRoutes> } = {
  poll: {
    key: 'poll',
    name: '/poll',
    subRouteMappings: {
      root: {
        key: 'root',
        name: '/',
        customConsoleMessages: [
          {
            1: { 
              text: '/poll', 
              color: ROUTE 
            },
            2: { 
              text: '200', 
              color: STATUSOK 
            },
            3: { 
              text: 'healthcheck success...', 
              color: INFO 
            }
          }
        ]
      }
    }
  }
}