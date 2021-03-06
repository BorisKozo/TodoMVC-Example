﻿/*global requirejs*/
'use strict';

requirejs.config({
    baseUrl: '/',
    waitSeconds: 3000,
    shim: {
        'jquery': {
            exports:'$'
        },
        'underscore': {
            exports: '_'
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'localstorage': {
            deps: ['underscore', 'backbone'],
            exports: 'LocalStorage'
        },
        'marionette': {
            deps: ['backbone', 'jquery'],
            exports: 'Marionette'
        },
        'handlebars': {
            exports: 'Handlebars'
        }

    },
    paths: {
        'jquery': 'lib/jquery',
        'underscore': 'lib/underscore',
        'backbone': 'lib/backbone',
        'localstorage': 'lib/backbone.localstorage',
        'marionette': 'lib/backbone.marionette',
        'handlebars': 'lib/handlebars',
        'i18nprecompile': 'lib/i18nprecompile',
        'json2': 'lib/json2',
        'hbs': 'lib/hbs'
    },
    hbs: {
        disableI18n: true
    }
});

require([
    'js/loader'
], function (loader) {
    loader.start();
});