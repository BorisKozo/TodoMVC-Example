// force the test environment to 'test'
process.env.NODE_ENV = 'test';
var Browser = require('zombie');
var expect = require('chai').expect;
var baseUrl = "localhost:1234";
var url = '/index.html';

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
      that.browser.visit(url, function(err, browser) {
         if (err) {
            callback(err);
         } else {
            waitForPageLoadEnd(callback);
         }
      });
   });

   it("allows to add a new todo item", function(done) {
      addItem("first item", function() {
         expect(that.browser.text("li.active")).to.eql("first item");
         done();
      })
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

   it("can mark an item as completed", function(done) {
      expect(that.browser.querySelector(".completed")).not.to.exist;
      addItem("first item", function() {
         that.browser.check(".toggle");
         expect(that.browser.querySelector(".completed")).to.exist;
         done();
      })
   });

   it("allows marking all items as completed using the toggle all button", function(done) {
      expect(that.browser.querySelector(".completed")).not.to.exist;
      addItem("first item", function() {
         addItem("second item", function() {
            that.browser.check("#toggle-all");
            expect(that.browser.querySelectorAll(".completed").length).to.eql(2);
            done();
         });
      });
   });

   it("doesn't allow to add an empty item", function(done) {
      expect(that.browser.querySelectorAll("li.active").length).to.eql(0);
      addItem("", function() {
         expect(that.browser.querySelectorAll("li.active").length).to.eql(0); //after adding empty item, no new item was created
         done();
      });
   });

   it("allows to filter and show only active items", function(done) {
      addItem("first item", function() {
         that.browser.check(".toggle");
         addItem("second item", function() {
            that.browser.clickLink(".filter-active");
            that.browser.wait(function() {
               return that.browser.querySelector("a.filter-active.selected")
            }, function() {
               expect(that.browser.text("#todo-list li.hidden")).to.eql("first item");
               done();
            });
         })
      });
   });

   it("allows to filter only completed items", function(done) {
      addItem("first item", function() {
         that.browser.check(".toggle");
         addItem("second item", function() {
            that.browser.clickLink(".filter-completed");
            that.browser.wait(function() {
               return that.browser.querySelector("a.filter-completed.selected")
            }, function() {
               expect(that.browser.text("#todo-list li.hidden")).to.eql("second item");
               done();
            });

         })
      });
   });

   it("allows deleting an item", function(done) {
      addItem("first item", function() {
         that.browser.pressButton(".destroy", function() {
            //console.log(that.browser.querySelectorAll("li"));
            expect(that.browser.querySelectorAll("li.active, li.complete, .destroy").length).to.eql(0);
            done();
         });
      });
   });

   it("shows a header and placeholder text when no item exists", function(done) {
      expect(that.browser.text("#header")).to.eql("todos");
      expect(that.browser.html("#new-todo")).to.have.string("What needs to be done?");
      done();
   });
})
;


