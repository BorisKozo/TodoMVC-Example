How we built TodoMVC - Example
==============================

#Prologue
[TodoMVC](http://addyosmani.github.com/todomvc/) is an internet project which offers
several implementations to a well defined application using various popular 
JavaScript MV* frameworks. We have implemented TodoMVC using [Backbone](http://backbonejs.org/) and [Marionette](http://marionettejs.com/) 
as our MV* frameworks, [Handlebars](http://handlebarsjs.com/) as our templating engine, and 
[RequireJS](http://requirejs.org/) as our AMD framework. Before continuing, you should get familiarized with the basic
concepts of the aforementioned frameworks and the flow of the TodoMVC application. In this text we present
and explain the various decisions we took while developing the TodoMVC application. Please feel free to leave your comments
and text edits in the [issues](https://github.com/BorisKozo/TodoMVC-Example/issues) section.

#Code Structure
Before we decided on the structure of the application we thought of the build and deployment process.
We had several possible options:

* Put all the code in a big JavaScript file (or concatenate several files into one file).

* Use Marionette built in modules.

* Use CommonJS style modules. 

* Use AMD style modules.

Clearly the first option is not a good idea for even a small size application, even when concatenating
several files into one big JavaScript file in order to enable easier development. There are various issues with this process 
starting from awkward debugging (where you debug a 7K lines file that keeps changing) and ending with dependencies on the order 
of the concatenation which are not always easy to overcome. The main benefit of this method is that it creates a single file
which is faster to download than lots of small files. Marionette modules are a good solution but they do not offer a full solution
for a larger scale application. Although in the case of TodoMVC Marionette modules are more than enough, we wanted to simulate building a large
scale application. The choice between CommonJS and AMD is harder because both concepts are somewhat similar and would fit our needs (For example Node.js
uses CommonJS style modules). We eventually decided to go with AMD style modules due to the following reasons:

* There is a complete solution for AMD style modules in the form of RequireJS.

* There is a full support of AMD modules by Marionette.

* There is a plug-in that supports handlebars templates for RequireJS.

* There is an optimizer which comes with RequireJS that allows compilation of a single JavaScript file for production mode.

Selecting AMD style modules using RequireJS as our modules system allowed us to use a simple directory structure
which is aligned with the TodoMVC specifications. The basic directory structure for our application is therefore:
````
|
|- lib
|- js
|  |- todo-list
|  |  |-views
|  |  |  |- templates
|  |  |- models
|  |  |- controller.js
|  |  |- router.js
|  |- main.js
|  |- app.js
|- css
|- index.html
````

