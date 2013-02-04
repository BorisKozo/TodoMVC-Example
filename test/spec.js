// force the test environment to 'test'
process.env.NODE_ENV = 'test';
var Browser = require('zombie');
var expect = require('chai').expect;

describe("Todo Application", function() {
   var browser = new Browser({
//      debug: true,
      proxy: "http://web-proxy.isr.hp.com:8080",
      site: "http://addyosmani.github.com/todomvc/architecture-examples/backbone/",
      waitFor: 2
   });

   function addItem(text, done) {
      browser.fill("#new-todo", "text");

      console.log(browser.fill("#new-todo"));
      done();
   }

   before(function(done) {
      browser.visit('#/', done);
   });


   it('shows "clear completed" button when there are completed items in the list', function(done) {
      addItem("first item", function () {
         expect(browser.querySelector("#todo-count")).to.exist;
         done();
      });

   });

   //   it("allows to add a new todo item", function() {
//
//
//      assert(browser.querySelector("#header"))
//      console.log("myheader it", browser.querySelector("#header"));
//   });
   /*it("saves the state after page refresh");
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
    */
   /*
    it('does not show "clear completed" button where there are no completed items in the list');
    it("shows the destroy icon only when hovering over an item");
    it('shows a counter of completed items');*/

});
