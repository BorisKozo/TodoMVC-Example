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
                $.when(promises).then(function () {
                    App.start();
                });
            }
        };
        return loader;
    });