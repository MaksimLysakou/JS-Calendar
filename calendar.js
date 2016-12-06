const MAX_TIMEOUT = 2147483647;
const SCHEDULER_INTERVAL = 60 * 1000;

function getNextExecuteDate (event) {
    return event.dateTime;
}
function Event(name, dateTime, callback) {
    this.name = name;
    this.dateTime = dateTime;
    this.callback = callback;

    this.id = undefined;
    this.timeout = undefined;
}
var Calendar = (function() {

    var events = [];

    function startEventScheduler() {
        var currentDate = new Date();
        
        if(event instanceof Event){
            if( ( event.dateTime - currentDate <= MAX_TIMEOUT ) &&
                ( event.dateTime - currentDate > 0 ) &&
                ( event.timeout === undefined ) ){
                event.timeout = setTimeout(event.callback, event.dateTime - currentDate);
            }
        }
    }

    function addEvent(event) {
        var timeout;
        var currentDate = new Date();
        
        if( (event.dateTime >= currentDate) && (event.dateTime - currentDate <= MAX_TIMEOUT) ){
            timeout = setTimeout(event.callback, event.dateTime - currentDate);
        }
        event.id = events.reduce(function(maxId, currentEvent) {
            return (maxId < currentEvent.id) ? currentEvent.id : maxId;
        }, 0) + 1;
        event.timeout = timeout;
        events.push(event);

        if(this.isSchedulerStarted == false){
            this.isSchedulerStarted = true;
            setInterval(startEventScheduler, SCHEDULER_INTERVAL);
        }
    }
    function deleteEventById(eventId) {
        for(var i =0; i<events.length; i++) {
            if(events[i].id === eventId) {
                clearTimeout(events[i].timeout);
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

                var currentDate = new Date();

                event.name = name;
                event.dateTime = date;

                if ((event.dateTime >= currentDate) && (event.dateTime - currentDate <= MAX_TIMEOUT)) {
                    event.timeout = setTimeout(event.callback, event.dateTime - currentDate);
                }
            }
        });
    }
    function getAllEvents() {
        return events;
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