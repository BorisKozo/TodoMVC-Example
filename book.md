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

### mini-app internal code structure
Each mini-app represents a closed functionality of the application. 
The external API of the mini-app is the `Marionette.Controller` which is responsible to creating and loading all the models and views.
The controller serves as an internal and external events vent for all the events within the miniapp. The mini-app directory contains the
`views` and the `models` directories. The `views` directory contains all the modules which return the constructor function for any kind of Marionette view (e.g. `Marionette.CompositeView`).
Inside the `views` directory we have the `templates` directory which contains all the templates consumed by the views of the mini-app. The `models` directory contains all the modules
which return either `Backbone.Model` or `Backbone.Collection` constructor functions. It is also possible to separate each construct to its own folder but since they are so tightly coupled
together we decided to put everything in one folder. 
(Note: A constructor function is what you get when you call Backbone.XXX.extend({}).)

# Application Flow
### Loading your mini-apps
We start the discussion of this section after the loader loads all the controllers of all the mini-apps.
At this point the loader calls the `controller.start()` function on each controller which, in turn, returns a jQuery promise.
The loader waits until all the promises are resolved and then starts the application. We dive into the load flow of the todo-list controller
as this flow should be similar for all controllers. In the controller `start` function we do two main things:

* The collections are created and loaded via the `fetch` function.

* The topmost views are loaded via the async `require` statement.

* The router of the mini-app is loaded via the async `require` statement.

After the async loads are done:

* An instance of each view is created and shown in the appropriate `Marionette.Region`.

* We register on the promise of the `fetch` function returned from the collection so that when it has been resolved
we update the todoList.

```js
todosCollection = new TodoItemCollection(),
todoPromise = todosCollection.fetch();
todoPromise.done(function () {
    _this.vent.trigger("todosUpdated", { collection: todosCollection });
});
```

An important thing to notice is that we don't wait for the collection to finish loading before we show the views.
We want an empty UI (or some "loading..." screen) to be visible to the user and when the collection is loaded it will fill the elements in the UI.

### Views and Sub-Views
In the previous section the controller loaded the topmost views (usually only the main 
`Marionette.Layout` is loaded in this stage). Each view of type 
`Marionette.Layout`, `Marionette.CompositeView`, and 
`Marionette.CollectionView` (i.e. the parent view) is responsible for 
loading all the sub-views (sub-views are the views that are embedded within 
the parent view) through the `define` statement of the module where the parent view
is defined. In our example the controller loads the `MainLayoutView` into the main
region of the page called `section`. `MainLayoutView`, as the name suggests, extends `Marionette.Layout`
and therefore it loads all the embedded views: `main_header_view`, `main_content_view`, and `main_footer_view`.

Each view of type `Marionette.Layout`, `Marionette.CompositeView`, 
and `Marionette.ItemView` is responsible
for loading its template. We will discuss views in details in the next section but for now
we can see that the template is loaded trough the `define` statement of the parent view
much like the sub-views.

```js
    define(['marionette', 'hbs!./templates/main_layout', './main_header_view', 
            './main_content_view', './main_footer_view', './../controller'],
        function (Marionette, layoutTemplate, MainHeaderView, 
                  MainContentView, MainFooterView, controller) {
```

After the parent view is loaded it is rendered by Backbone using the `render` function. 
Marionette allows you to perform some logic right after the view is rendered by calling
`onRender` function (similar to what you would expect in any .NET control). In the 
`onRender` function the `el` of your view is ready and you are able to show/render
all the sub-views. In the case of our `MainLayoutView` we create and show three sub-views 
into the internal regions:

```js
    onRender: function () {
        this.header.show(new MainHeaderView());
        this.content.show(new MainContentView({ collection: this.options.todosCollection }));
        this.footer.show(new MainFooterView());
    }
```

We can see that the `TodoItemCollection` that was instantiated in the controller 
is passed on to the appropriate sub-view. The `MainContentView` is of type `Marionette.CompositeView` and
it is responsible for maintaining the correct state of the collection within our application.
This is the place to mentions the two possible approaches of instantiating and passing your
collections and models. The first approach is the one we take in this application. The collection
is instantiated by the controller and passed on only to the view which is responsible for all 
the collection operations (i.e. `MainContentView`). To convey various events of the collection
we use the controller as the EventBus through the `vent` property which is an extension of
`Backbone.Events` object.

```js
     var Controller = Marionette.Controller.extend({
        vent: _.extend({}, Backbone.Events),
```

This approach is more of the OO style because the collection remains 'isolated' from 
all other objects except the one which encapsulates it. The same approach works for models
encapsulated in `Marionette.ItemView` or `Marionette.CompositeView`.
The second approach is to instantiate the collection (or model) in the controller but pass it to
any view or module that needs to track the events of that collection. In this approach
the collection itself is the EventBus (`Backbone.Collection` already extends `Backbone.Events` so
the collection instance itself is the vent). The benefit of this approach is that
every module has an easy access to the collection and it does not need to route the 
logic through a common event bus. For our project we took the first approach.

### Template Loading

One of the key aspects in a Backbone application is managing templates for the views.
For our implementation of TodoMVC we selected Handlebars as our templating framework.
The nice thing about this selection is that there is a plugin which allows RequireJS
to load and compile the templates as if they were regular script files. The plugin is
developed by Alex Slexton and is simply named [require-handlebars-plugin](https://github.com/SlexAxton/require-handlebars-plugin).
From now on we refer to the plugin by the friendly name `hbs`. To use the plugin we added
```js
    hbs: { disableI18n: true }
```
to the `requirejs.config()` call so that the plugin internal i18n interpreter isn't loaded. 
We also added the plugin main file `hbs.js` and all of its dependencies (`i18nprecompile.js` and `json2.js`)
to the `lib` directory and into the `path` attribute of `requirejs.config()`. Now we are ready 
to load the templates from our views. To load a template we created our template files with the extension
`.hbs` within the `templates` directory.  Let's revisit the module definition of the `MainLayoutView`.
The second parameter of the `define` statement (`'hbs!./templates/main_layout'`) tells the `hbs` plugin
to load the file `main_layout.hbs` in the relative directory `templates`. The `!` notation tells RequireJS
to use the plugin for loading the file. In the appropriate variable of the `define` callback (i.e. `layoutTemplate`)
we get the compiled Handlebars template. This is very good because the `template` property of a Marionette view 
expects you to set it to a compiled template. Voila! Your template is now loaded just as needed and cached by the RequireJS
internal caching mechanism. 


