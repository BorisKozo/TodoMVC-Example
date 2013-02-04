// force the test environment to 'test'
process.env.NODE_ENV = 'test';

var wd = require("wd");



describe("Todo Application", function() {

   it("allows to add a new todo item");
   it("saves the state after page refresh");
   it("can mark an item as completed");
   it("allows deleting an item");
   it("allows editing an item using mouse double click");
   it("allows marking all items as completed using the toggle all button");
   it("shows how many items are left to be done");
   it('has a "todo" header');
   it("shows all items by default");
   it("allows to filter only active items");
   it("allows to filter only completed items");
   it("doesn't allow to add en empty item");
   it("adds trims items before adding");
   it('shows "clear completed" button when there are completed items in the list');
   it('does not show "clear completed" button where there are no completed items in the list');
   it("shows the destroy icon only when hovering over an item");
   it('shows a counter of completed items');

});
