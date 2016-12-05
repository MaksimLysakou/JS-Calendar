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

// function ExtendedEvent(name, dateTime, callback, repeats, preliminaryCallback, preliminaryDelay) {
//     Event.apply(this, arguments);
//
//     this.repeats = repeats;
//     this.preliminaryCallback = preliminaryCallback;
//     this.preliminaryDelay = preliminaryDelay;
//
//     this.preliminaryCallbackTimeout = undefined;
// }
// ExtendedEvent.prototype = Object.create(Event.prototype);

var Calendar = (function() {

    var events = [];
    var lastId = 0;

    function startEventScheduler() {
        if(event instanceof Event){
            if( ( event.dateTime - new Date() <= INT32_MAX ) &&
                ( event.dateTime - new Date() > 0 ) &&
                ( event.timeout === undefined ) ){
                event.timeout = setTimeout(event.callback, event.dateTime - new Date());
            }
        }
    }

    function addEvent(event) {
            var timeout;
            if( (event.dateTime >= new Date()) && (event.dateTime - new Date() <= INT32_MAX) ){
                timeout = setTimeout(event.callback, event.dateTime - new Date());
            }
            event.id = ++lastId;
            event.timeout = timeout;
            events.push(event);

            if(this.isSchedulerStarted == false){
                this.isSchedulerStarted = true;
                setInterval(startEventScheduler, 1000*60);
            }
    }
    function deleteEventById(eventId) {
        for(var i =0; i<events.length; i++) {
            if(events[i].id === eventId) {
                clearTimeout(events[i].timeout);

                // if(events[i] instanceof ExtendedEvent){
                //     clearTimeout(events[i].preliminaryCallbackTimeout);
                // }
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
                }

                // if (event instanceof ExtendedEvent) {
                //     clearTimeout(event.preliminaryCallbackTimeout);
                //     event.preliminaryCallbackTimeout = undefined;
                //
                //     var nextExecute = getNextExecuteDate(event) - new Date();
                //     if ((nextExecute >= 0) && (nextExecute <= INT32_MAX)) {
                //         event.timeout = setTimeout(event.callback, nextExecute);
                //         event.preliminaryCallbackTimeout = setTimeout(event.preliminaryCallback, nextExecute - event.preliminaryDelay);
                //     }
                // }
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
        getEventsBetweenDates: getEventsBetweenDates,
        startEventScheduler:  startEventScheduler
    };
}());

Calendar.isSchedulerStarted = false;

