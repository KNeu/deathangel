var builder = require('botbuilder');

var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);

bot.dialog('/', [
    function (session) {
        builder.Prompts.text(session, "Hello... What's your name?");
    },
    function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, "Hi" + results.response +", How many years have you been coding?");
    },
    function (session, results) {
        session.userData.coding = results.response;
        builder.Prompts.choice(session, "What language do you code Node using?", ["Javascript", "CoffeeScript", "TypeScript"]);

    },
    function (session, results) {
        session.userData.language = results.reposnse.entity;
        session.send("Got it... " + session.userData.name + 
        "you've been programming for " + 
        session.userData.coding +
        " years and use " + session.userData.language + ".");

    }
]);
