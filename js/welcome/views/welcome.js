define(['backbone', 'marionette', 'hbs!./templates/welcome'],
   function(Backbone, Marionette, layoutTemplate) {
       'use strict';
       var WelcomeLayout = Marionette.Layout.extend({
           template: layoutTemplate
       });
       return WelcomeLayout;
   });