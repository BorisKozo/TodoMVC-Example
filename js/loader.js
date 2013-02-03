/*global define*/

define(['require', './app', './todo-list/controller', './todo-list/router'],
    function (require, App) {
        'use strict';
        var loader = {
            start: function () {
                var controller = require('./todo-list/controller');
                    //Load and start all the controllers
                    controller.start();
                    App.start();
                
            }
        };
        return loader;
    });