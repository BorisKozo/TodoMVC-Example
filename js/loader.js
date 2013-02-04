/*global define*/

define(['require', 'jquery', './app', './todo-list/controller'],
    function (require, $, App) {
        'use strict';
        var loader = {
            start: function () {
                var controller = require('./todo-list/controller');
                //Load and start all the controllers
                $.when(controller.start()).then(function () {
                    App.start();
                });
            }
        };
        return loader;
    });