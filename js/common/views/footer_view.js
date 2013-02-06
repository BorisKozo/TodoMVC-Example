/*global define*/

define(['marionette', 'hbs!../../common/views/templates/footer'], function (Marionette, footerTemplate) {
    'use strict';

    var FooterView = Marionette.ItemView.extend({
        template: footerTemplate
    });

    return FooterView;
});