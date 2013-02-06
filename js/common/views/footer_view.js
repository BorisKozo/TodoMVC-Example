/*global define*/

define(['marionette', 'hbs!../../common/views/templates/footer'], function(Marionette, footerTemplate) {
    'use strict';

    var FooterView = Marionette.ItemView.extend({
        template: footerTemplate,

        initialize: function(options){
            this.hint = options.hint;
        },

        serializeData: function() {
            return {hint: this.hint};
        }
    });

    return FooterView;
});