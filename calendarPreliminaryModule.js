function Event(name, dateTime, callback) {
    this.name = name;
    this.dateTime = dateTime;
    this.callback = callback;

    this.repeats = [];

    this.id = undefined;
    this.timeout = undefined;
    
    this.preliminaryCommonTimeout = undefined;
}

Calendar.addPreliminaryCallback = function (callback, delay) {
    Calendar.preliminaryCallback = callback;
    Calendar.preliminaryDelay = delay;
};
Calendar.startEventScheduler = function() {
    var events = Calendar.getAllEvents();

    events.forEach(function (event) {
        var nextExecute = getNextExecuteDate(event) - new Date();
        if (( nextExecute <= INT32_MAX ) &&
            ( nextExecute > 0 ) &&
            ( event.timeout === undefined )) {

            event.timeout = setTimeout(event.callback, nextExecute);
            event.preliminaryCommonTimeout = setTimeout(Calendar.preliminaryCallback,
                nextExecute - Calendar.preliminaryDelay);
        }
    });
};
Calendar.addEvent = function (event) {
    var events = Calendar.getAllEvents();

    var nextExecute = getNextExecuteDate(event) - new Date();
    if( (nextExecute >= 0) && (nextExecute <= INT32_MAX) ){
        event.timeout = setTimeout(event.callback, nextExecute);
        event.preliminaryCommonTimeout = setTimeout(Calendar.preliminaryCallback,
            nextExecute - Calendar.preliminaryDelay);
    }

    event.id = events.reduce(function(maxId, currentEvent) {
            return (maxId < currentEvent.id) ? currentEvent.id : maxId;
        }, 0) + 1;
    events.push(event);

    if(Calendar.isSchedulerStarted == false){
        Calendar.isSchedulerStarted = true;
        setInterval(Calendar.startEventScheduler, 60 * 1000);
    }
};
Calendar.editEventById = function (eventId, name, date) {
    var events = Calendar.getAllEvents();

    events.forEach(function(event) {
        if(event.id === eventId) {
            if(name !== undefined)
                event.name = name;

            if(date !== undefined){
                clearTimeout(event.timeout);
                event.timeout = undefined;

                event.dateTime = date;

                var nextExecute = getNextExecuteDate(event) - new Date();

                clearTimeout(event.preliminaryCommonTimeout);
                event.preliminaryCommonTimeout = undefined;

                if ((nextExecute >= 0) && (nextExecute <= INT32_MAX)) {
                    event.timeout = setTimeout(event.callback, nextExecute);

                    event.preliminaryCommonTimeout = setTimeout(Calendar.preliminaryCallback,
                        nextExecute - Calendar.preliminaryDelay);
                }
            }
        }
    });
};
Calendar.deleteEventById = function (eventId) {
    var events = Calendar.getAllEvents();

    for(var i = 0; i<events.length; i++) {
        if(events[i].id === eventId) {
            clearTimeout(events[i].timeout);
            clearTimeout(events[i].preliminaryCommonTimeout);
            events.splice(i, 1);
            break;
        }
    }
};