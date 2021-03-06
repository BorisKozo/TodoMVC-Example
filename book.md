How we built TodoMVC - Example
==============================

# Prologue

[TodoMVC](http://addyosmani.github.com/todomvc/) is a project which offers a wide verity of
 implementations to a well defined application (called TodoMVC) using popular 
JavaScript MV* frameworks. We have implemented TodoMVC using
[Backbone](http://backbonejs.org/) 
and [Marionette](http://marionettejs.com/) as our core MV* frameworks, 
[Handlebars](http://handlebarsjs.com/) as our templating engine, and 
[RequireJS](http://requirejs.org/) as our AMD framework. Before continuing, you 
should get familiarized with the basic concepts of the aforementioned frameworks 
and the flow of the TodoMVC application. In this chapter we present
and explain the various decisions we took while developing this flavor of TodoMVC application. 
Please feel free to leave your comments and contributions in the 
[issues](https://github.com/BorisKozo/TodoMVC-Example/issues) section. Note that for
the sake of this example we added a welcome screen which is not part of the specification.
The welcome screen takes you to our implementation of TodoMVC which is aligned with the 
spec.

# Code Structure

Before deciding on the structure of the application we must think of the build and deployment process.
We consider several possibilities:

* Put all the code in a big (actually HUGE) JavaScript file (or concatenate several files into one file).

* Use Marionette built in modules.

* Use CommonJS style modules. 

* Use AMD style modules.

Clearly the first option is not a good idea for even a small sized application, 
even when concatenating several separate files into one big JavaScript file 
in order to enable easier development. There are various issues with this process 
starting from awkward debugging (where you debug a >7K lines file that keeps changing
under your feet) and ending with dependencies on the order of the concatenation 
which are not always easy to overcome. The main benefit of this method is that it
creates a single file which is faster to download than many small files, especially on
high latency connections. Marionette modules are a good solution but they do not 
offer a full solution for a larger scale application. Although in the case of 
TodoMVC Marionette modules are more than enough, we want to simulate building 
a large scale application. The choice between CommonJS and AMD is harder because 
both concepts are somewhat similar and would fit our needs (For example Node.js
uses CommonJS style modules). Our decision is to go with AMD style modules due 
to the following reasons:

* There is a complete solution for AMD style modules in the form of the RequireJS framework.

* There is a full support of AMD modules by Marionette.

* There is a plug-in that supports handlebars templates for RequireJS.

* There is an optimizer which comes with RequireJS that allows compilation of all the
code into a single JavaScript file for production mode.

Choosing AMD style modules using RequireJS as our modules system allows us to use a 
simple directory structure which is aligned with the TodoMVC specifications. 

### Directory Structure

The basic directory structure for our application is:
````
|
|- lib
|- js
|  |- common
|  |- welcome
|  |  |-views
|  |  |  |- templates
|  |  |- controller.js
|  |  |- router.js
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
(For brevity we omit some of the internal files).

In the root folder we have only one file which is `index.html`. Since we are using 
RequireJS, the content of the `index.html` file is quite simple. In it we have the 
stylesheet and the base script of TodoMVC (downloaded from the TodoMVC project page)
, and some basic layouting of our application (a section and a footer). 
The most important element is the last script tag 

    <script data-main="js/main" src="lib/require.js"></script>

It tells RequireJS to load a file named `main.js` from the `js` directory using 
the RequireJS script file `require.js` which exists in the lib directory.
More details on the structure of `main.js` in the next section.

The lib directory contains all the third party libraries we are using. At this point we described
Backbone, [Underscore](http://underscorejs.org) and [jQuery](http://jquery.com/) which are dependencies of Backbone,
RequireJS, and Marionette.

The `js` directory contains all the mini-apps (sometimes called module-apps) 
directories and all the JavaScript which is common in all the mini-apps in 
the common directory. For example, todo-list is a mini-app and it contains 
folders for the two main Backbone constructs: models and views 
(we regard Backbone collections as models but it is possible to create a 
separate directory for the collection files). We discuss the folder structure 
of a single mini-app in detail in one of the next sections.

The `assets` directory is a requirement of the TodoMVC specification and is 
not important for this discussion. It contains the resources needed by the 
specification to support the common look and feel of the TodoMVC application.

### main.js

As we mention above, `main.js` is the first file that is loaded by the browser 
when our application starts. This file contains the configuration for RequireJS 
in a `requirejs.config({})` call. The first things we define are the `baseUrl` , 
the `shims`, and the `paths` of the libs our application is using. 
The `baseUrl` property determines the base path for all the non-relative paths used 
to require modules. The `shims` property defines the order of loading for all 
the non-AMD modules we are loading. In our application we load jQuery, Underscore, 
Backbone, and Marionette from the lib directory. RequireJS makes sure that all the 
shims are loaded in the old fashioned script tag style in your final HTML page and 
that those script tags appear in a correct order (based on the dependencies in the code).  

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
        vent: _.extend({}, Backbone.Events)
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

# Application Logic - Deep Dive
In this section we will deep dive into the implementation of the various views, collections, 
and models of our application. We will explain the main logic and the considerations we took
to make the logic as it is implemented. 

### Outline
The following image depicts the outline of our application in terms of views/templates:
![Views Layout](/images/views.png)


The application (`Marionette.Application`) splits the viewable area into two regions.
The footer region contains the `footer_view` view (`Marionette.ItemView`) which displays
three lines of text. This view is not important to the discussion. The main `section` region
which contains the `main_layout` (`Marionette.Layout`) view. `main_layout` in itself
splits the main area into three sub-views. 

`main_header_view` (`Marionette.ItemView`) is responsible for
the input line that adds a new 'todo'. Note that the `main_header_view` view is the only visible view when
there are no todos in the list. This is enforced by the logic within `main_layout_view` according to
the specifications of the TodoMVC application. The function `updateSubViews` is responsible for showing
and hiding the footer and the content according to the state of the todos collection. `_isDataVisible` is an
internal property which keeps track of the current visibility of these two regions.

```js
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
            }
```

`main_content_view` (`Marionette.CompositeView`) is responsible for rendering the entire
todos list. The model part of the composite view (the part that doesn't contain the collection) contains
only the toggle button which located to the left of the `main_header_view` input box. As we mention above
the `main_content_view` is responsible for performing all the operations on the collection and triggering the 
appropriate events on the EventBus. We decided to trigger the events from the view and not directly from the 
collection to allow some decoupling between the collection and the controller. In fact the guideline we used
is that the collections/models are not dependant on anything (except for inner dependencies required by Marionette).
The collection part of `main_content_view` contains a list which renders `todo_item_view` for each element in the 
collection creating the list in the UI.

`main_footer_view` (`Marionette.ItemView`) is responsible for displaying the footer of the list. The footer contains information
regarding the completion state of the todos in the list and allows you to filter the list based on the completion state or remove
all the completed todos. What is important about this view is that it is strongly coupled (in terms of data) with the todos collection
which is controlled by the `main_content_view`. Therefore, the updates in this view are done through events on the EventBus. In fact,
we have only one event, `todosUpdated`, which is sent when the todos collection is updated. The event passes just enough information
to allow the `main_footer_view` to update all the controls on the UI without allowing the `main_footer_view` perform operations
on the collection itself.

`todo_item_view` (`Marionette.ItemView`) is a single line in the list of todos. This
view is instantiated by `main_content_view` when it renders its collection. This view holds
the `TodoItem` model and handles all the [CRUD](http://en.wikipedia.org/wiki/Create,_read,_update_and_delete) operations of a single todo item.

### main_header_view
As we state above, `main_header_view` is responsible for entering text for a new todo. Note that it is
not responsible for creating a new todo, this view doesn't even "know" what a todo it. It's job is simple,
wait for the user to input some text in the text box. If the `return` key is pressed trigger an event that
the user submitted some text on the EventBus and clear the input. The triggered event is `todoTextReady`.

```js
       inputKeypress: function(e) {
         var ENTER_KEY = 13,
            todoText = this.ui.input.val().trim();

         if (e.which === ENTER_KEY && todoText) {
            controller.vent.trigger('todoTextReady', todoText);
            this.ui.input.val('');
         }
      }
``` 

### todo_item_view
Before we jump into the details of `main_content_view` lets review the inner workings of
`todo_item_view`. This view is responsible for all the operations done on a single todo
line. The user can perform one of three operations on this view:

* A click on the 'V' (left side) completes/uncompletes the todo. The click event handler delegates
to a function called `finishClicked` which sets the `isFinished` model property and triggers the 
`finishChanged` event on the collection, passing the changed model. We don't make use of the automatically triggered 
`change:isFinished` event to be able to aggregate all the changed models into one event in the 
case where more than one model's `isFinished` property has changed.

```js
        finishClicked: function (e) {
            var finishState = e.target.checked;
            this.model.set('isFinished', finishState);
            this.model.collection.trigger('finishChanged', [this.model], this.model.collection);
        }
```

* A click on the 'X' (right side) removes the todo from the list. This is quite straight forward as we call
the `model.destroy()` function and let Backbone do all the magic.

```js
        deleteClicked: function () {
            this.model.destroy();
        }
```

* A double-click on the todo text enters the edit mode where the label showing the todo text is
replaced by a text box which allows you to enter new text (even if this todo is completed). 
To show the text box we simple change some pre-defined css classes. The interesting part is the handling
of the `focusout` event on the text box which, essentially, submits the edited text. In the event handler
we verify that the given text is not empty and decide whether we want to save or delete it. The TodoMVC specifications
dictate that we delete the todo if the edited text is empty.

```js
        editFocusout: function () {
            var todoText = this.ui.input.val().trim();
            if (todoText) {
                this.model.set('todoText', todoText);
                this.$el.removeClass('editing');
                this.render();
            } else {
                this.deleteClicked();
            }
        }
```

Note that after we change the model property `todoText` we re-render the view. 
Rendering the view triggers the `onRender` function where we manipulate the UI
to comply with the model properties. This is the correct place to manipulate the UI 
since the view may be re-rendered from various execution paths (e.g. when the user 
clicks the toggle all completed button) and it must always be rendered correctly. 

```js
         onRender: function () {
            var finishState = this.model.get('isFinished');

            this.$el.removeClass('hidden');
            this.$el.removeClass('editing');

            if (controller.displayMode === controller.displayModes.active && this.model.get('isFinished')) {
                this.$el.addClass('hidden');
            }

            if (controller.displayMode === controller.displayModes.completed && !this.model.get('isFinished')) {
                this.$el.addClass('hidden');
            }

            if (finishState) {
                this.$el.removeClass('active').addClass('completed');
            } else {
                this.$el.addClass('active').removeClass('completed');
            }
            this.ui.finishedCheckbox.prop('checked', finishState);
        }
```

### main_content_view
`main_content_view` is where all the collection operations happen. The only UI element
which is controlled by the `main_content_view` is the toggle-all button (on the left of the 
header text box) which toggles the completion state of all the todos in the list. The most important
thing to note here is the regular separation between the operation and the UI change. For example, to
add a new model to the collection we listen to the `todoTextReady` event on the EventBus. When the event
is triggered we add a new model to the collection with the provided text (we don't make any updates yet). 
This triggers  the `add` event on the collection. We listen to the `add` collection event and when it is triggered
we trigger the `todosUpdated` event on the EventBus. We listen to the `todosUpdated` event on the EventBus
and when that is triggered we update the check state of the toggle-all button according to the TodoMVC specifications.

```js
            initialize: function () {
                controller.vent.on('todoTextReady', this.addTodo, this);
                controller.vent.on('todosUpdated', this.todosUpdated, this);
            }

            addTodo: function (todoText) {
                this.collection.push({ todoText: todoText });
            }

            collectionEvents: {
                'add': 'todoAdded',
            }

            todosUpdated: function (data) {
                var hasUnfinished = data.collection.some(function (item) {
                    return !item.get('isFinished');
                });

                this.ui.toggleAll.prop('checked', !hasUnfinished);
            }
```

A similar flow happens when a model is removed from the collection or when a collection is
reset. 

### main_footer_view

The `main_footer_view` performs three main functions:

* Displaying the number of incomplete todos in the todos list. To this end the view
listens to the `todosUpdated` event on the EventBus. When this event is triggered the 
event argument is an array of all the models (although this can be optimized to contain
a separate list of the changed models) from which the view can easily calculate the number
of incomplete items by reading the `isFinished` property of each model. The view keeps 
two variables to track the current state: `unfinishedItemsCount` the number of incomplete todos and
`finishedItemsCount` the number of complete todos. When the view is rendered the template expects
these two properties to be passed in to the template rendering function. Fortunately for us, Marionette 
handles this case by allowing the view to override a function called `SerializeData`. The return value
of this function is passed to the template rendering function allowing us to easily pass the two stored values.
We could use a specialized model to store the two values for consistency but we felt that we rather not create
transient models and therefore decided to store the two properties directly on the view.

```js
        serializeData: function () {
            return {
                unfinishedItemsCount: this.unfinishedItemsCount,
                finishedItemsCount: this.finishedItemsCount,
                itemString: this.unfinishedItemsCount === 1 ? 'item' : 'items'
            };
        },

        updateData: function (data) {
            var count = 0;
            data.collection.each(function (todo) {
                if (!todo.get('isFinished')) {
                    count += 1;
                }
            });

            this.unfinishedItemsCount = count;
            this.finishedItemsCount = data.collection.length - count;

            this.render();
        }
```

* Allowing the user to filter between three views. The first view called "All" shows all the todos, the second
called "Active" shows only the incomplete todos, and finally the third view called "Completed" shows only the completed
todos which were not removed from the list. Since TodoMVC is a [single page application](http://en.wikipedia.org/wiki/Single-page_application)
we are changing the filtering through internal routing using `Backbone.Router` or more specifically `Marionette.AppRouter` which extends 
`Backbone.Router` and adds the controller connection to it. We capture three routes as defined by the TodoMVC specifications and route them
to the appropriate functions in the controller.

```js
    var MainRouter = Marionette.AppRouter.extend({
        appRoutes: {
            '': 'displayModeAll',
            'active': 'displayModeActive',
            'completed': 'displayModeCompleted'
        },
        controller: controller
    });
```

The tree functions implemented on the controller basically do the same thing: set the current display mode
on the controller and trigger the `displayModeChanged` event on the EventBus.

```js
            displayModes: {
                all: 'All',
                active: 'Active',
                completed: 'Completed'
            },

            displayModeAll: function () {
                this.displayMode = this.displayModes.all;
                this.vent.trigger('displayModeChanged', this.displayMode);
            },

            displayModeActive: function () {
                this.displayMode = this.displayModes.active;
                this.vent.trigger('displayModeChanged', this.displayMode);
            },

            displayModeCompleted: function () {
                this.displayMode = this.displayModes.completed;
                this.vent.trigger('displayModeChanged', this.displayMode);
            }
```

The event is captured by the `main_footer_view` itself to update the selected caption
of the appropriate view and by the `todo_item_view` to update the visibility of each item
based on the current display mode.

```js
        onRender: function () {
            var finishState = this.model.get('isFinished');

            this.$el.removeClass('hidden');

            if (controller.displayMode === controller.displayModes.active && finishState) {
                this.$el.addClass('hidden');
            }

            if (controller.displayMode === controller.displayModes.completed && !finishState) {
                this.$el.addClass('hidden');
            }
```
										 
**Note how every view retains its responsibility and handles its own assets based on events on the EventBus.**
**This is a key element in good separation of concerns and modular application design.**

* Allowing the user to remove all the completed todos with a single click. When there is one or more complete todo
in the todos list, the `main_footer_view` displays a button which displays the number of complete todos. Clicking the button removes
the todos from the list. At this point you should be able to figure out the implementation of this functionality. Clicking
the "Clear completed" button does not affect the todos list directly because it is not the responsibility of the `main_footer_view` to do so.
Instead, it triggers a `clearCompleted` event on the EventBus. The `main_content_view` is listening to this event and removes
all the todos from the todos collection. Since the collection has changed, `main_content_view` triggers the `todosUpdated` event
on the EventBus. The `main_footer_view` listens to the `todosUpdated` event and retenders itself according to the todos collection state, in this
case hiding the "Clear completed" button.

### Integrating with Backbone.localStorage

The specifications of TodoMVC require us to retain the todos between browser
refreshes. This means that we must store the todos somewhere. Fortunately Backbone
architecture allows extensions and mixins. We use the Backbone.localStorage extension
to store the todos in the browser local storage. First we add the definition for Backbone.localStorage
to the `shims` and the `paths` properties in `main.js`. Once we do that, the plugin
overrides a key function in Backbone called `Backbone.sync`. This function is responsible
for the saving and loading of Backbone models. The new `Backbone.sync` function checks
if the model (or collection) has a property called `localStorage`. If this property doesn't exist then
it the original `Backbone.sync` function is called. If this property exists then the implementation
of the plugin is called. The implementation of the plugin saves and loads each model to and from
the local storage of the browser. Adding the plugin and setting the property makes our entire implementation
work with the local storage without additional effort.

```js
    var TodoItemCollection = Backbone.Collection.extend({
        model: TodoItem,
        localStorage: new Backbone.LocalStorage("TodoItemCollection")
```

We pass a key name to the `Backbone.LocalStorage` constructor function. It uses that
key to store our data in a partition of the local storage with that name.


# Optimizing with r.js

RequireJS provides an optimization tool called `r.js` which optimizes the code for 
production use. We give a small taste of the tool's capabilities by compiling all of
the application code into one file called `main-built.js`. `r.js` is capable of doing
various operation to optimize your code, see [full documentation here](http://requirejs.org/docs/optimization.html).
To use `r.js` you need to install it using [Node.js](http://nodejs.org/) package manager (a.k.a. `npm`). Make sure
you have Node.js installed on your system, open a command line window in the project directory and write `npm install`.
After the installation is over you should have a directory called `node_modules` in the project directory. Do not
commit or change files from that directory in your repository. To run `r.js` you need 
a configuration file that sets all the relevant options. We provide such a file for our
project called `app.build.js`. The configuration file resembles the `main.js` file of our 
project but has some optimization related properties defined. Please refer to the `r.js` documentation for
full information on all the properties or use [this annotated source](https://github.com/jrburke/r.js/blob/master/build/example.build.js). 

To build `main-built.js` run the following command from the project directory:
````
node node_modules\requirejs\bin\r.js -o app.build.js
````

The optimizer finds all the dependencies and the loading order and creates a single `js` file
that contains a concatenated version of all the `js` files that would load on your page. You can 
browse to `index2.html` to see that the resulting page behaves the same as the original page
but with a significant performance boost on high latency connections.

# Testing

### Setting the environment

Solid Testing suite is a crucial component of building a robust JavaScript application. This is especially
important due to JavaScript dynamic nature and lack of compiler. There are many alternatives to create and run tests.
[Mocha](http://visionmedia.github.com/mocha/) and [Jasmine]a(http://pivotal.github.com/jasmine/) are the two most
popular unit tests frameworks. Both are quite similar in functionality and use rSpec BDD syntax (`describe` and `it`) with a large and active community. We have implemented our tests suite using Mocha; it runs over node.js, therefore very easy to install and update using node.js' `npm` package manager. 

It is a common practice to devide that basic tests into two layers: unit tests and functional tests. Unit test tests specific part of the code in isolation (e.g. non-trivial function). Functional test tests the functional behavior of the application, usually from the prespective of the end-user. In this sample application we have only implemented the functional tests.

The tests are running in the [Zombie.js](http://zombie.labnotes.org/) browser which is a headless browser. It means that it doesn't have a GUI and it is only useful for testing. The advantages are that the tests execute fast and can run in environment that doesn't have GUI.(such as CI server). The disadvantages are that it might be harder to debug the tests, and that it does not support cross-browser testing. It is important to note that currently, Zombie.js is currently [not supported](http://stackoverflow.com/questions/9851977/how-to-install-zombie-js-on-windows-7-node-js-headless-browser) in Windows.

To start using Mocha, you must install [Node.js](http://nodejs.org). Next, install 
the required node.js packages by typing: 
````
    npm install mocha zombie chai
````

`chai` is a BDD assertion library for node and it allows you to easily declare the 
conditions (sometimes called expectations) that can make your test pass or fail (verification points).
If one of the declated expectations fails, then the entire mocha test fails.
You can add a file called `mocha.opts` and place it in the tests directory. 
Add the following line to the `mocha.opts` file to set the reporter output 
for the tests runner.
 
````
--reporter spec
````
 
Add the following line to the `mocha.opts` file to tell Mocha to do a recursive 
search for `test` directories and execute the code in them. 

````
--recursive
````


The content of the `mocha.opts` file should be:

```js
		--reporter spec
		--recursive
```

### Writing the tests

The tests are implemented in the `/test/functional.js` file. 
In BDD style tests, you choose a module as the test target. Then, you describe 
the module's functionality using common language. 
For example, we describe our TodoMVC application as follows: 

* it allows to add a new todo item
* it shows how many items left to be done
* can mark an item as completed

In the `test` directory we add the following skeleton implementation.

```js
		describe("Todo application", function(){
			it("allows to add a new todo item");
			it("shows how many items left to be done")
			it("can mark an item as completed")
		})
```

To run the tests, type `mocha` in the console. At this point, all the tests are presented 
as "pending" since we did not provide an implementation. The implementation is done 
by manipulating the Zombie.js browser object. Mocha provides a `beforeEach()` function 
which is executed before each test. In this function we create a new browser instance; 
we do not reuse the browser to prevent interactions between different tests. 
We then use the `visit` method of the browser to navigate to a specific URL. 

A very important pitfall in JavaScript acceptance testing is the wait issue. 
In a traditional web page, the page DOM is constructed from an HTML file. In this case,
when the code is in the $(window).ready() function, all the DOM is guaranteed to be 
ready. However, in a single page JavaScript application, the DOM is built dynamically. 
This poses a difficulty for testing tools as they cannot know when the page was fully 
loaded. If the testing tool tries to execute code that interacts with the DOM before 
it is fully loaded, the tests fails. Consider our TodoMVC application; when the 
application page is first loaded is doesn't contain any UI elements. Only then, 
RequireJS dynamically loads the `main_header_view` which allows adding new todos. 
If we consider our first test (adding new todo item); it will probably fail, since 
the text box in which the user enters the text for the todo item doesn't exist yet.
To handle this case we have to explicitly wait for some condition to become satisfied. 
In the tests, we check that an item with id `#new-todo` exists. We use it as 
indication that the JavaScript code executed and created the relevant DOM elements. 

```js
		function waitForPageLoadEnd(callback) {
			that.browser.wait(function() {
				return that.browser.querySelector("#new-todo");
			}, callback);
		}
```

A Mocha test function takes a `done` function as an argument. It is the 
responsibility of the user to call this function when the 
test finishes its execution. This is required due to Mocha's async nature. 
The `done` function notifies the Mocha framework that all the relevant code was executed 
and that it can now report the test as complete. If the `done` function is not 
invoked in a timely manner, Mocha reports the test as failed due to timeout. 

```js
		it("allows to add a new todo item", function(done) {
			addItem("first item", function() {
				expect(that.browser.text("li.active")).to.eql("first item");
				done();
			})
		});
```

EOF






