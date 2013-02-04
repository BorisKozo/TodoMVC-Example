/*global define*/

define(['marionette', 'hbs!./templates/main_layout', './main_header_view', './main_content_view', './main_footer_view', './../controller'],
    function (Marionette, layoutTemplate, MainHeaderView, MainContentView, MainFooterView, controller) {
        'use strict';
        var SlideAnimationDuration = 0, MainLayoutView = Marionette.Layout.extend({
            template: layoutTemplate,
            regions: {
                header: '#header',
                content: '#main',
                footer: '#footer'
            },

            ui: {
                'footer': '#footer',
                'content': '#main'
            },

            initialize: function () {
                controller.vent.on('todosUpdated', this.updateSubViews, this);
                this._isDataVisible = false;
            },

            updateSubViews: function (data) {
                if (data.collection.length === 0 && this._isDataVisible) {
                    this.ui.footer.hide(SlideAnimationDuration);
                    this.ui.content.hide(SlideAnimationDuration);
                    this._isDataVisible = false;
                    return;
                }

                if (!this._isDataVisible && data.collection.length > 0) {
                    this.ui.footer.show(SlideAnimationDuration);
                    this.ui.content.show(SlideAnimationDuration);
                    this._isDataVisible = true;
                }
            },

            onRender: function () {
                this.header.show(new MainHeaderView());
                this.content.show(new MainContentView({ collection: this.options.todosCollection }));
                this.footer.show(new MainFooterView());
            },

            onClose: function () {
                controller.vent.off(null, null, this);
            }

        });

        return MainLayoutView;
    });