How we built TodoMVC - Example
==============================

# Prologue
[TodoMVC](http://addyosmani.github.com/todomvc/) is an internet project which offers
several implementations to a well defined application using various popular 
JavaScript MV* frameworks. We have implemented TodoMVC using [Backbone](http://backbonejs.org/) and [Marionette](http://marionettejs.com/) 
as our MV* frameworks, [Handlebars](http://handlebarsjs.com/) as our templating engine, and 
[RequireJS](http://requirejs.org/) as our AMD framework. Before continuing, you should get familiarized with the basic
concepts of the aforementioned frameworks and the flow of the TodoMVC application. In this text we present
and explain the various decisions we took while developing the TodoMVC application. Please feel free to leave your comments
and text edits in the [issues](https://github.com/BorisKozo/TodoMVC-Example/issues) section.

# Code Structure
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
which is aligned with the TodoMVC specifications. 

### Directory Structure

The basic directory structure for our application is:
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
|- assets
|- index.html
````
(Note that only the main files are displayed).

In the root folder we currently have only one file which is `index.html`. Since we are using 
RequireJS, the content of the `index.html` file is quite simple. We have the stylesheet and the base script of TodoMVC, 
and some basic layouting of our application (a section and a footer). The most important element is the last
script tag 

    <script data-main="js/main" src="lib/require.js"></script>

It tells RequireJS to load a file named `main.js` from the `js` directory using the RequireJS script from the lib directory.
More on `main.js` in the next section.

The lib directory contains all the third party libraries we are using. At this point we added
Backbone, [Underscore](http://underscorejs.org), and [jQuery](http://jquery.com/) which are dependencies of Backbone,
RequireJS and Marionette.

The `js` directory contains all the mini-apps (sometimes called module-apps) directories and all the JavaScript 
which is common in all the mini-apps. For example, todo-list is a mini-app and it contains folders for the two main
Backbone constructs: models and views (we regard Backbone collections as models but it is possible to create a separate directory).
We discuss the folder structure of a single mini-app in detail in one of the next sections.

The `assets` directory is a requirement of the TodoMVC specification and is not important for this discussion. It contains
the resources needed by the specification to support the common look and feel of the TodoMVC application.

### main.js
As we mentioned above, `main.js` is the first file that is loaded by the browser when our application starts.
This file contains the configuration for RequireJS in a `requirejs.config({})` call.
The first thing we define is the `baseUrl` , the `shims`, and the `paths` of the application. The `baseUrl` determines
the base path in all the non-relative paths used to require modules. The `shims` define the order of loading for all the non-AMD modules we are loading.
In our application we load jQuery, Underscore, Backbone, and Marionette from the lib directory. RequireJS makes sure that all the shims are loaded in
the old fashioned script tag style in your final HTML page and that all the files are in the correct order (based on the dependencies in the code).  

After the call to `requirejs.config()` we delegate our call to the `loader`. This step is not mandatory but we wanted to keep `main.js` clean of any logic.
The call to the loader simply calls `loader.start()`:
```js
 require(['js/loader', function (loader) {
    loader.start();
});
```

### The loading process and loader.js
Before we look at the code of `loader.js` we describe the outline of the loading process. RequireJS needs to 
figure out the loading order of the various modules. Clearly the Marionette Application must be loaded first and it must not 
depend on any other module. This allows us to pass the App object to any other module that uses the `addInitializer` functionality before the loader starts the Application. 
We must also load and start all the controllers and all the routers before `Backbone.history.start()` is called.
Once the App is loaded it can be passed down to all subsequently loaded modules 
(specifically controllers) and then started using `App.start()`. 
The full loading order is therefore (--> means "loads" or "depends on"):

````
    main.js       --> loader.js
    loader.js     --> app.js
    loader.js     --> controller.js 
    loader.js     --> router.js
    controller.js --> app.js (dosn't load anything since loader.js already loaded the app)
    controller.js --> some_view.js
    controller.js --> some_model.js
    some_view.js  --> template
````
