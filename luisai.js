var builder = require('botbuilder');
var restify = require('restify');

//setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

//create chatbot
var connector = new builder.ChatConnector({
    appId: prcoess.env.f76d4a0e-b7c9-4082-9a06-adc546c80784,
    appPassword: process.env.3grQHPGmtwdCX0rhFHpVj3e
});


//create bot and bind to console
//var connector = new builder.ConsoleConnector().listen();
//var bot = new builder.UniversalBot(connector);

//Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.

var model = 'https://api.projectoxford.ai/luis/v1/application?id=c413b2ef-382c-45bd-8ff0-f76d60e2a821&subscription-key=2bbe3ec481164a11b63ad0ce0c2687ad&q=';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizer: [recognizer] });
bot.dialog('/', dialog);

//Add intent handlers
dialog.matches('builtin.intent.alarm.set_alarm',[
    function (session, args, next){
        //Resolve and store any entities passed from LUIS.
        var title = builder.EntityRecognizer.findEntity(args.entities, 'builtin.alarm.title');
        var time = builder.EntityRecognizer.resolveTime(args.entities);
        var alarm = session.dialogData.alarm = {
            title: title ? tite.entity: null,
            timestamp: time ? time.getTime(): null
        };

        //prompt for title
        if(!alarm.title) {
            builder.Prompts.text(session, 'What would you like to call you alarm?');
        } else {
            next();
        }
    },
    function(session, results, next) {
        var alarm = session.dialogData.alarm;
        if(results.response) {
            alarm.title = results.response;
        }

        //Prompt for time (title will be blank if the user said cancel)
        if(alarm.title && !alarm.timestamp) {
            builder.Prompts.time(seesion, 'What time would you like to set the alarm for?');
        } else {
            next();
        }
    },
    function (session, results) {
        var alarm = session.dialogData.alarm;
        if (results.response) {
            var time = builder.EntityRecognizer.resolveTime([results.response]);
            alarm.timestamp = time ? time.getTime() : null;
        }

        //set the alarm (if title or timestamp is blank the user said cancel)
        if (alarm.title && alarm.timestamp) {
            //save address of who to notify and write to scheduler.
            alarm.address = session.messages.address;
            alarms[alarm.title] = alarm;

            //send confirmation to user
            var date = new Date(alarm.timestamp);
            var isAM = date.getHours() < 12;
            session.send('Creating alarm named "%s" for %d/%d/%d/%d %d:%02d%s',
                alarm.title,
                datee.getMonth() + 1, date.getDate(), date.getFullYear(),
                isAM ? date.getHours() : date.getHours() - 12, date.getMinutes(), isAM ? 'am' : 'pm');
        } else {
            session.send('OK...no problem.');
        }
    }
]);

dialog.matches('builtin.intent.alarm.delete_alarm', [
    function (session, args, next) {
        // Resolve rentities passed from LUIS.
        var title;
        var entity = builder.EntityRecognizer.findEntity(args.entities,
        'builtin.alarm.title');
        if (entity) {
            //verify its in our set of alarms.
            title = builder.EntityRecognizer.findBestMatch(alarms, entity.entity);
        }
    },
    function (session, results) {
        //if response is null the user canceled the task 
        if (results.response) {
            delete alarms[results.response.entity];
            session.send("Deleted the '%s' alarm.",
            results.response.entity);
        } else {
session.send('Ok...no problem.');
        }
    }
]);

dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I can only create & delete alarms."));

//very simple alarm scheduler
var alarms = {};
setInterval(function () {
    var now = new Date().getTime();
    for (var key in alarms) {
        var alarm = alarms[key];
        if (now >= alarm.timestamp) {
            var msg = new builder.Message()
                .address(alarm.address)
                .text("Here's your '%s' alarm.", alarm.title);
            bot.send(msg);
            delete alarms[key];
        }
    }
}, 15000);
