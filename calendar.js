// Description
// $param
// jsdoc
//$return



const INT32_MAX = 2147483647;

function Event(name, dateTime, callback) {
    this.name = name;
    this.dateTime = dateTime;
    this.callback = callback;

    this.id = undefined;
    this.timeout = undefined;
}

function ExtendedEvent(name, dateTime, callback, repeats, preliminaryCallback, preliminaryDelay) {
    Event.apply(this, arguments);

    this.repeats = repeats;
    this.preliminaryCallback = preliminaryCallback;
    this.preliminaryDelay = preliminaryDelay;

    this.preliminaryCallbackTimeout = undefined;
}
ExtendedEvent.prototype = Object.create(Event.prototype);

function getNextExecuteDate (event) {
    var nextExecuteDate = new Date(event.dateTime);

    if(event.repeats === undefined || event.repeats.length == 0) {
        return nextExecuteDate;
    }else{
        var currentDate = new Date();
        if(event.repeats.indexOf(currentDate.getDay()) != -1){

            nextExecuteDate.setFullYear(currentDate.getFullYear());
            nextExecuteDate.setMonth(currentDate.getMonth());
            nextExecuteDate.setDate(currentDate.getDate());

            if(event.dateTime.getHours() > currentDate.getHours()){
                return nextExecuteDate;
            }

            if(event.dateTime.getHours() == currentDate.getHours()){
                if(event.dateTime.getMinutes() > currentDate.getMinutes()){
                    return nextExecuteDate;
                }

                if(event.dateTime.getMinutes() == currentDate.getMinutes()){
                    if(event.dateTime.getSeconds() > currentDate.getSeconds()){
                        return nextExecuteDate;
                    }

                    if(event.dateTime.getSeconds() == currentDate.getSeconds()){
                        if(event.dateTime.getMilliseconds() > currentDate.getMilliseconds())
                            return nextExecuteDate;
                    }
                }
            }
        }

        var nextExecuteDay = event.repeats[0];

        for (var repeat in event.repeats){
            if(repeat > currentDate.getDay()){
                nextExecuteDay = repeat;
                break;
            }
        }

        nextExecuteDate.setFullYear(currentDate.getFullYear());
        nextExecuteDate.setMonth(currentDate.getMonth());

        if(nextExecuteDay > currentDate.getDay()){
            nextExecuteDate.setDate(currentDate.getDate() + nextExecuteDay - currentDate.getDay());
            return nextExecuteDate;
        } else {
            nextExecuteDate.setDate(currentDate.getDate() + nextExecuteDay - currentDate.getDay() + 7)
            return nextExecuteDate;
        }
    }
}


//TODO: common event

var Calendar = (function() {

    var events = [];
    var lastId = 0;

    var startEventScheduler = function(){
        events.forEach(function(event) {
            if(event instanceof ExtendedEvent){
                var nextExecute = getNextExecuteDate(event) - new Date();
                if( ( nextExecute <= INT32_MAX ) &&
                    ( nextExecute > 0 ) &&
                    ( event.timeout === undefined ) ){
                    event.timeout = setTimeout(event.callback, nextExecute);
                    event.preliminaryCallbackTimeout =
                        setTimeout(event.preliminaryCallback, nextExecute - event.preliminaryDelay);
                }
            }else{
                if(event instanceof Event){
                    if( ( event.dateTime - new Date() <= INT32_MAX ) &&
                        ( event.dateTime - new Date() > 0 ) &&
                        ( event.timeout === undefined ) ){
                        event.timeout = setTimeout(event.callback, event.dateTime - new Date());
                    }
                }
            }


        });
    };
    setInterval(startEventScheduler, 1000);

    function addEvent(event) {
        if(event instanceof ExtendedEvent){
            var nextExecute = getNextExecuteDate(event) - new Date();
            if( (nextExecute >= 0) && (nextExecute <= INT32_MAX) ){
                event.timeout = setTimeout(event.callback, nextExecute);
                event.preliminaryCallbackTimeout = setTimeout(event.preliminaryCallback, nextExecute - event.preliminaryDelay);
            }
            event.id = ++lastId;
            events.push(event);
        }
        else if(event instanceof Event){
            var timeout;
            if( (event.dateTime >= new Date()) && (event.dateTime - new Date() <= INT32_MAX) ){
                timeout = setTimeout(event.callback, event.dateTime - new Date());
            }
            event.id = ++lastId;
            event.timeout = timeout;
            events.push(event);
        }
    }
    function deleteEventById(eventId) {
        for(var i =0; i<events.length; i++) {
            if(events[i].id === eventId) {
                clearTimeout(events[i].timeout);
                //events[i].timeout = undefined; //In any case we remove this event
                if(events[i] instanceof ExtendedEvent){
                    clearTimeout(events[i].preliminaryCallbackTimeout);
                }
                events.splice(i, 1);
                break;
            }
        }
    }
    function editEventById(eventId, name, date) {
        events.forEach(function(event) {
            if(event.id === eventId) {
                clearTimeout(event.timeout);
                event.timeout = undefined;

                event.name = name;
                event.dateTime = date;

                if ((event.dateTime >= new Date()) && (event.dateTime - new Date() <= INT32_MAX)) {
                    event.timeout = setTimeout(event.callback, event.dateTime - new Date());
                    // If we didn't set any timeout, set it as undefined
                }

                if (event instanceof ExtendedEvent) {
                    clearTimeout(event.preliminaryCallbackTimeout);
                    event.preliminaryCallbackTimeout = undefined;

                    var nextExecute = getNextExecuteDate(event) - new Date();
                    if ((nextExecute >= 0) && (nextExecute <= INT32_MAX)) {
                        event.timeout = setTimeout(event.callback, nextExecute);
                        event.preliminaryCallbackTimeout = setTimeout(event.preliminaryCallback, nextExecute - event.preliminaryDelay);
                    }
                }
            }
        });


    }
    function getAllEvents() {
        return events.slice();
    }
    function getEventsByDay(date) {

        return events.filter(function(event) {
            return (event.dateTime.getDate() === date.getDate() &&
            event.dateTime.getMonth() === date.getMonth() + 1 &&
            event.dateTime.getYear() === date.getYear());
        });
    }
    function getEventsByWeek() {
        var currentDate = new Date();
        var startOfAWeek = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1,
            currentDate.getDate() - currentDate.getDay() + 1);
        var endOfAWeek = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1,
            currentDate.getDate() - currentDate.getDay() + 7, 23, 59, 59, 999);

        return events.filter(function(event) {
            return (event.dateTime <= endOfAWeek && event.dateTime >= startOfAWeek);
        });
    }
    function getEventsByMonth() {
        var currentDate = new Date();

        return events.filter(function(event) {
            return (event.dateTime.getMonth() === currentDate.getMonth() + 1 &&
            event.dateTime.getYear() === currentDate.getYear());
        });
    }
    function getEventsBetweenDates(date1, date2) {
        return events.filter(function(event) {
            return (event.dateTime <= date2 && event.dateTime >= date1);
        });
    }


    return {
        addEvent: addEvent,
        deleteEventById: deleteEventById,
        editEventById: editEventById,
        getAllEvents: getAllEvents,
        getEventsByDay: getEventsByDay,
        getEventsByWeek: getEventsByWeek,
        getEventsByMonth: getEventsByMonth,
        getEventsBetweenDates: getEventsBetweenDates
    };
}());


function logDate() {
    var currentDate = new Date();
    console.log("["
        + currentDate.getHours()
        + ":" + currentDate.getMinutes()
        + ":" + currentDate.getSeconds()
        + "] " + "Callback happens"
    );

}
//
var date1 = new Date();
date1.setSeconds(date1.getSeconds() + 5);
//
// var date2 = new Date();
// date2.setSeconds(date2.getSeconds() + 15);
//
// var date3 = new Date();
// date3.setSeconds(date3.getSeconds() + 60);
//
var extEvent = new ExtendedEvent("name2", date1, logDate, [1, 2], logDate, 2000);
//
// Calendar.addEvent(new Event("name1", new Date(1000, 10, 20), logDate));
 Calendar.addEvent(extEvent);
// Calendar.addEvent(new Event("name3", date2, logDate));
// Calendar.addEvent(new Event("name4", date3, logDate));
// Calendar.addEvent(new Event("name5", new Date(2016, 12, 27), logDate));
// карирование
// string templates

// findindex + polyfil

var exDate = getNextExecuteDate(extEvent);
console.log(
    exDate.getDate() + "." +
    exDate.getMonth() + "." +
    exDate.getFullYear() + " " +
    exDate.getHours() + ":" +
    exDate.getMinutes() + ":" +
    exDate.getSeconds()
);
