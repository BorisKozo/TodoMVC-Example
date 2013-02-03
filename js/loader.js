/*global define*/

define(['require', './app'],
    function (require, App) {
        'use strict';
        var loader = {
            start: function () {
                require(['./todo-list/controller', './todo-list/router'], function (controller) {
                    //Load and start all the controllers
                    controller.start();
                    App.start();
                });
            }
        };
        return loader;
    });