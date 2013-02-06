/*global define*/

define(['require', 'jquery', 'backbone', 'marionette', 'underscore', 'js/app'],
   function(require, $, Backbone, Marionette, _, App) {
      'use strict';
      var Controller = Marionette.Controller.extend({
         vent: _.extend({}, Backbone.Events),

         welcome: function() {
            require(['./views/welcome_view', './router'], function(WelcomeView, FooterView) {
               App.section.show(new WelcomeView());
            });
         },

         start: function() {
             var result = $.Deferred();
             require(['./views/welcome_view', './router'], function() {
                 result.resolve();
             });
             return result.promise();
         }
      });

      return new Controller();
   });