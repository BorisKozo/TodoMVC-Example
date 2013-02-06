/*global define*/

define(['require', 'jquery', 'backbone', 'marionette', 'underscore', 'js/app', './models/todo_item_collection'],
   function(require, $, Backbone, Marionette, _, App, TodoItemCollection) {
       'use strict';

       var initialize = function() {
              var _this = controller,
                 todosCollection = new TodoItemCollection(),
                 todoPromise = todosCollection.fetch();

              var MainLayoutView = require('./views/main_layout_view'),
                 FooterView = require('./../common/views/footer_view');
              App.section.show(new MainLayoutView({ todosCollection: todosCollection }));
              App.footer.show(new FooterView());
              todoPromise.done(function() {
                  _this.vent.trigger("todosUpdated", { collection: todosCollection });
              });
          },

          Controller = Marionette.Controller.extend({
              vent: _.extend({}, Backbone.Events),

              displayModes: {
                  all: 'All',
                  active: 'Active',
                  completed: 'Completed'
              },

              displayModeAll: function() {
                  initialize();
                  this.displayMode = this.displayModes.all;
                  this.vent.trigger('displayModeChanged', this.displayMode);
              },

              displayModeActive: function() {
                  initialize();
                  this.displayMode = this.displayModes.active;
                  this.vent.trigger('displayModeChanged', this.displayMode);
              },

              displayModeCompleted: function() {
                  initialize();
                  this.displayMode = this.displayModes.completed;
                  this.vent.trigger('displayModeChanged', this.displayMode);
              },

              start: function() {
                  var result = $.Deferred();
                  require(['./views/main_layout_view', './../common/views/footer_view', './router'], function() {
                      result.resolve();
                  });
                  return result.promise();
              }

          }),

          controller = new Controller();

       return controller;
   });