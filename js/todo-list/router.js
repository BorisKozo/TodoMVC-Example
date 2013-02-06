/*global define*/

define(['marionette', './controller'], function (Marionette, controller) {
    'use strict';
    var MainRouter = Marionette.AppRouter.extend({
        appRoutes: {
            'all': 'displayModeAll',
            'active': 'displayModeActive',
            'completed': 'displayModeCompleted'
        },
        controller: controller
    });

    return new MainRouter();
});