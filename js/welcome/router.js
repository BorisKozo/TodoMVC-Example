define(['marionette', './controller'], function (Marionette, controller) {
   'use strict';
   var WelcomeRouter = Marionette.AppRouter.extend({
      appRoutes: {
          '': 'welcome'
      },
      controller: controller
   });

   return new WelcomeRouter();
});