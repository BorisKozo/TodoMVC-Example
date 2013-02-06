/*global define*/

define(['require', 'jquery', 'backbone', 'marionette', 'underscore', 'js/app', './models/todo_item_collection'],
   function(require, $, Backbone, Marionette, _, App, TodoItemCollection) {
       'use strict';

       var initialize = function() {
              var _this = controller,
                 result = $.Deferred(),
                 todosCollection = new TodoItemCollection(),
                 todoPromise = todosCollection.fetch();

              require(['./views/main_layout_view', './views/footer_view', './router'], function(MainLayoutView, FooterView) {
                  App.section.show(new MainLayoutView({ todosCollection: todosCollection }));
                  App.footer.show(new FooterView());
                  todoPromise.done(function() {
                      _this.vent.trigger("todosUpdated", { collection: todosCollection });
                  });
                  result.resolve();
              });
              return result.promise();
          },

          Controller = Marionette.Controller.extend({
              vent: _.extend({}, Backbone.Events),

              displayModes: {
                  all: 'All',
                  active: 'Active',
                  completed: 'Completed'
              },

              displayModeAll: function() {
                  var that = this;
                  initialize().done(function() {
                      that.displayMode = that.displayModes.all;
                      that.vent.trigger('displayModeChanged', that.displayMode);
                  });
              },

              displayModeActive: function() {
                  var that = this;
                  initialize().done(function() {
                      that.displayMode = that.displayModes.active;
                      that.vent.trigger('displayModeChanged', that.displayMode);
                  });
              },

              displayModeCompleted: function() {
                  var that = this;
                  initialize().done(function() {
                      that.displayMode = that.displayModes.completed;
                      that.vent.trigger('displayModeChanged', that.displayMode);
                  });
              },

              start: function() {
                  var result = $.Deferred();
                  require(['./views/main_layout_view', './views/footer_view', './router'], function() {
                      result.resolve();
                  });
                  return result.promise();
              }

          }),

          controller = new Controller();

       return controller;
   });