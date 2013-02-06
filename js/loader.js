/*global define*/

define(['require', 'jquery', 'underscore', './app',
    './todo-list/controller','./welcome/controller'],
    function (require, $, _, App) {
        'use strict';
        var loader = {
            start: function () {
                var promises = [],
                   controllers = ['./todo-list/controller', './welcome/controller'];
                _(controllers).each(function(controllerName) {
                    promises.push(require(controllerName).start());
                });
                $.when.apply(this, promises).then(function () { //we call apply because "when" expects all the promises to be passed as separate arguments and not as an array
                    App.start();
                });
            }
        };
        return loader;
    });