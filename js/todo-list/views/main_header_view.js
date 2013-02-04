/*global define*/


define(['marionette', 'hbs!./templates/main_header', './../controller'], function(Marionette, headerTemplate, controller) {
   'use strict';
   var MainHeaderView = Marionette.ItemView.extend({
      template: headerTemplate,
      ui: {
         'input': '#new-todo'
      },
      events: {
         'keypress #new-todo': 'inputKeypress',
         'click #submit-new-todo': 'simulateEnterKeypress'
      },

      inputKeypress: function(e) {
         var ENTER_KEY = 13,
            todoText = this.ui.input.val().trim();

         if (e.which === ENTER_KEY && todoText) {
            controller.vent.trigger('todoTextReady', todoText);
            this.ui.input.val('');
         }
      },

      /*
      This function is only used for testing. We added a transparent button on which the
      testing framework clicks to add the item
       */
      simulateEnterKeypress: function(){
         this.inputKeypress({which: 13});
      }

   });

   return MainHeaderView;
});