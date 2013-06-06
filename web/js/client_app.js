(function DemoViewModel() {

  var that = this;
  var eb = new vertx.EventBus(window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/eventbus");
  that.items = ko.observableArray([]);

  eb.onopen = function() {
    // Get the static data
    eb.send("vertx.mongopersistor", {action: "find", collection: "requests", matcher: {}},
      function(reply) {
        if (reply.status === "ok") {
          var requestArray = [];
          for (var i = 0; i < reply.results.length; i++) {
            requestArray[i] = new Task(reply.results[i]);
          }
          console.log(requestArray)
          that.requests = ko.observableArray(requestArray);
          ko.applyBindings(that);
        } 
        else {
          console.error("Failed to retrieve requests: " + reply.message);
        }
      });
  };

  eb.onclose = function() {
    eb = null;
  };

  this.statusCodes = ko.observableArray(["" ,"NOT STARTED", "PENDING", "DONE"])
  this.authors = ko.observableArray(["", "Grokzen"])

  that.saveItem = function(task) {
    /* This should be used to save/update an existing item in the database */
    item = ko.toJS(task)

    var msg = {
      action: "update",
      collection: "requests",
      criteria: {
        _id: item._id
      },
      objNew: {
        request: item.request,
        status: item.status,
        author: item.author,
        path: item.path
      },
      upsert: true,
      multi: false
    }

    eb.send('vertx.mongopersistor', msg, function(reply) {
      if (reply.status === "ok") {
        console.log("Msg sent OK!")
      } 
      else {
        console.error('Failed to accept order');
      }
    });
  }

  that.removeItem = function(task) {
    item = ko.toJS(task)
    that.requests.remove(task);

    eb.send("vertx.mongopersistor", {action: "delete", collection: "requests", matcher: {_id: item._id}}, function(reply) {
      if (reply.status === "ok") {
        console.log("Deleted proper");
      }
      else {
        console.error("Failed to remove the specefied item");
      }
    });
  };

  that.createItem = function() {
    task = new Task({_id: "", request: "", status: "", author: "", path: ""})
    that.requests.push(task);

    var orderItems = ko.toJS(task);
    var orderMsg = {
      action: "save",
      collection: "requests",
      document: {
        items: orderItems
      }
    }

    eb.send('vertx.mongopersistor', orderMsg, function(reply) {
      if (reply.status === "ok") {
        console.log("Task created")
        task._id = reply._id
      } 
      else {
        console.error('Failed to accept order');
      }
    });
  };

  /* Construct for an Task */
  function Task(json) {
    var that = this;
    that._id = json._id;
    that.request = json.request;
    that.status = json.status;
    that.author = json.author;
    that.path = json.path;
  }

  that.csscolor = function(status) {
    /* This is used to color the rows dependeing on the current set status */
    /* Usage Example: <tr data-bind="style: {color: csscolor(status)}"> */
    if (status === "PENDING") {
      return "orange";
    }
    else if (status === "DONE") {
      return "green";
    }
    else if (status === "NOT STARTED") {
      return "red"
    }
    return "black"  // Default color
  };
})();
