/*global define*/

define(['require', 'jquery', 'backbone', 'marionette', 'underscore', 'js/app'],
   function(require, $, Backbone, Marionette, _, App) {
       'use strict';
       var Controller = Marionette.Controller.extend({
           vent: _.extend({}, Backbone.Events),

           welcome: function() {
               var WelcomeView = require('./views/welcome');
               var FooterView = require('../common/views/footer_view');
               App.section.show(new WelcomeView());
               App.footer.show(new FooterView({hint: "Please click one of the links above"}));
           },

           start: function() {
               var result = $.Deferred();
               require(['./router', './views/welcome', '../common/views/footer_view'], function() {
                   result.resolve();
               });
               return result.promise();
           }
       });

       return new Controller();
   });