import vertx

# Our application config - you can maintain it here or alternatively you could
# stick it in a conf.json text file and specify that on the command line when
# starting this verticle

# Configuration for the web server
web_server_conf = {

    # Normal web server stuff
    "port": 8080,
    "host": "localhost",
    "ssl": False,

    # Configuration for the event bus client side bridge
    # This bridges messages from the client side to the server side event bus
    "bridge": True,

    # This defines which messages from the client we will let through
    # to the server side
    "inbound_permitted":  [
        # Allow calls to get static data from the persistor
        {
            "address": "vertx.mongopersistor",
            "match": {
                "action": "find",
                "collection": "requests"
            }
        },
        # And to place orders
        {
            "address": "vertx.mongopersistor",
            "requires_auth": False,  # User must be logged in to send let these through
            "match": {
                "action": "save",
                "collection": "requests"
            }
        },
        {
            "address": "vertx.mongopersistor",
            "requires_auth": False,
            "match": {
                "action": "delete",
                "collection": "requests"
            }
        },
        {
            "address": "vertx.mongopersistor",
            "requires_auth": False,
            "match": {
                "action": "update",
                "collection": "requests"
            }
        }
    ],

    # This defines which messages from the server we will let through to the client
    "outbound_permitted": [
        {}
    ]
}

# And when it"s deployed run a script to load it with some reference
# data for the demov
def deploy_handler(err, id):
    if err is None:
        print("Done deploying")
    else:
        print("Failed to deploy %s" % err)

# Now we deploy the modules that we need
# Deploy a MongoDB persistor module
vertx.deploy_module("io.vertx~mod-mongo-persistor~2.0.0-final", handler=deploy_handler)

# Start the web server, with the config we defined above
vertx.deploy_module("io.vertx~mod-web-server~2.0.0-final", web_server_conf)
