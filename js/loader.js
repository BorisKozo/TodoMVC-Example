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
                $.when.apply(this, promises).then(function () { //the apply is a trick to convert the array to comma separated list required by when
                    App.start();
                });
            }
        };
        return loader;
    });