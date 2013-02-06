define(['backbone', 'marionette', 'hbs!./templates/main_welcome', ],
   function(Backbone, Marionette, welcomeTemplate) {
       'use strict';
       var WelcomeView = Marionette.Layout.extend({
           template: welcomeTemplate,

           regions: {
               header: '#header',
               content: '#main',
               footer: '#footer'
           },

           ui: {
               'footer': '#footer',
               'content': '#main'
           },

           onRender: function(){

           }

       });
       return WelcomeView;
   });