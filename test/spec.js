// force the test environment to 'test'
process.env.NODE_ENV = 'test';
var Browser = require('zombie');
var expect = require('chai').expect;
var baseUrl = "localhost:1234";
var secondaryUrl = '/index.html#';

describe("Todo Application", function() {
   var that = this;

   function addItem(text, callback) {
      that.browser.fill("#new-todo", text);
      that.browser.pressButton("#submit-new-todo");
      callback();
   }

   function waitForPageLoadEnd(callback) {
      that.browser.wait(function() {
         return that.browser.querySelector("#new-todo");
      }, callback);
   }

   beforeEach(function(callback) {
      that.browser = new Browser({
         //debug: true,
         //proxy: "http://web-proxy.isr.hp.com:8080",
         site: baseUrl,
         waitFor: 4
      });
      that.browser.visit(secondaryUrl, null, function() {
         waitForPageLoadEnd(callback);
      });
   });


   it('shows how many items left', function() {
      expect(that.browser.text("#todo-count strong")).to.equal("0");
      addItem("first item", function() {
         expect(that.browser.text("#todo-count strong")).to.equal("1");
         addItem("second item", function() {
            expect(that.browser.text("#todo-count strong")).to.equal("2");
         });
      });
   });


//   it("saves the state after page refresh", function(done) {
//      addItem("first item", function() {
//         expect(that.browser.text("#todo-count strong")).to.equal("1");
//      });
//      that.browser.reload(function() {
//         waitForPageLoadEnd(function() {
//         console.log(that.browser.html());
////            expect(that.browser.text("#todo-count strong")).to.equal("1");
//            done();
//         })
//      })
//   });

   it("can mark an item as completed", function(done){
      expect(that.browser.querySelector(".completed")).not.to.exist;
      addItem("first item",function(){
         that.browser.check(".toggle");
         expect(that.browser.querySelector(".completed")).to.exist;
         done();
      })
   });

   it("allows marking all items as completed using the toggle all button", function(done){
      expect(that.browser.querySelector(".completed")).not.to.exist;
      addItem("first item",function(){
         addItem("second item",function(){
            that.browser.check("#toggle-all");
            expect(that.browser.querySelectorAll(".completed").length).to.eql(2);
            done();
         });
      });
   });

   it("doesn't allow to add en empty item",function(done){
      expect(that.browser.querySelectorAll("li.active").length).to.eql(0);
      addItem("",function(){
         expect(that.browser.querySelectorAll("li.active").length).to.eql(0); //after adding empty item, no new item was created
         done();
      });
   });

   xit("allows to filter only active items", function(){

   });

   /*xit('shows "clear completed" button when there are completed items in the list', function(done) {

    });*/

//   it("allows to add a new todo item", function() {
//
//
//      assert(browser.querySelector("#header"))
//      console.log("myheader it", browser.querySelector("#header"));
//   });
   /*

    it("allows deleting an item");
    it("allows editing an item using mouse double click");

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
    */


})
;


