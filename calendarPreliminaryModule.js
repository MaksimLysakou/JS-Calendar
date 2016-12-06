function Event(name, dateTime, callback, preliminaryCallback, preliminaryDelay) {
    this.name = name;
    this.dateTime = dateTime;
    this.callback = callback;

    this.repeats = [];

    this.id = undefined;
    this.timeout = undefined;
    
    this.preliminaryCommonTimeout = undefined;

    this.preliminaryCallback = preliminaryCallback;
    this.preliminaryDelay = preliminaryDelay;
    this.preliminaryTimeout = undefined;
}

if(Calendar !== undefined) {
    Calendar.addPreliminaryCallback = function (callback, delay) {
        Calendar.preliminaryCallback = callback;
        Calendar.preliminaryDelay = delay;
    };
    Calendar.startEventScheduler = function () {
        var events = Calendar.getAllEvents();

        events.forEach(function (event) {
            var nextExecute = getNextExecuteDate(event) - new Date();
            if (( nextExecute <= MAX_TIMEOUT ) &&
                ( nextExecute > 0 ) &&
                ( event.timeout === undefined )) {

                event.timeout = setTimeout(event.callback, nextExecute);

                if (Calendar.preliminaryCallback != undefined) {
                    event.preliminaryCommonTimeout = setTimeout(
                        Calendar.preliminaryCallback,
                        nextExecute - Calendar.preliminaryDelay
                    );
                }

                if (event.preliminaryCallback != undefined) {
                    event.preliminaryTimeout = setTimeout(event.preliminaryCallback,
                        nextExecute - event.preliminaryDelay);
                }
            }
        });
    };
    Calendar.addEvent = function (event) {
        var events = Calendar.getAllEvents();

        var nextExecute = getNextExecuteDate(event) - new Date();
        if ((nextExecute >= 0) && (nextExecute <= MAX_TIMEOUT)) {
            event.timeout = setTimeout(event.callback, nextExecute);

            if (Calendar.preliminaryCallback != undefined) {
                event.preliminaryCommonTimeout = setTimeout(
                    Calendar.preliminaryCallback,
                    nextExecute - Calendar.preliminaryDelay
                );
            }

            if (event.preliminaryCallback != undefined) {
                event.preliminaryTimeout = setTimeout(
                    event.preliminaryCallback,
                    nextExecute - event.preliminaryDelay
                );
            }
        }

        event.id = events.reduce(function (maxId, currentEvent) {
                return (maxId < currentEvent.id) ? currentEvent.id : maxId;
            }, 0) + 1;
        events.push(event);

        if (Calendar.isSchedulerStarted == false) {
            Calendar.isSchedulerStarted = true;
            setInterval(Calendar.startEventScheduler, SCHEDULER_INTERVAL);
        }
    };
    Calendar.editEventById = function (eventId, name, date) {
        var events = Calendar.getAllEvents();

        events.forEach(function (event) {
            if (event.id === eventId) {
                if (name !== undefined)
                    event.name = name;

                if (date !== undefined) {
                    clearTimeout(event.timeout);
                    event.timeout = undefined;

                    clearTimeout(event.preliminaryCommonTimeout);
                    event.preliminaryCommonTimeout = undefined;

                    clearTimeout(event.preliminaryTimeout);
                    event.preliminaryTimeout = undefined;

                    event.dateTime = date;

                    var nextExecute = getNextExecuteDate(event) - new Date();

                    if ((nextExecute >= 0) && (nextExecute <= MAX_TIMEOUT)) {
                        event.timeout = setTimeout(event.callback, nextExecute);

                        if (Calendar.preliminaryCallback != undefined) {
                            event.preliminaryCommonTimeout = setTimeout(
                                Calendar.preliminaryCallback,
                                nextExecute - Calendar.preliminaryDelay
                            );
                        }

                        if (event.preliminaryCallback != undefined) {
                            event.preliminaryTimeout = setTimeout(
                                event.preliminaryCallback,
                                nextExecute - event.preliminaryDelay
                            );
                        }
                    }
                }
            }
        });
    };
    Calendar.deleteEventById = function (eventId) {
        var events = Calendar.getAllEvents();

        for (var i = 0; i < events.length; i++) {
            if (events[i].id === eventId) {
                clearTimeout(events[i].timeout);
                clearTimeout(events[i].preliminaryCommonTimeout);
                clearTimeout(events[i].preliminaryTimeout);
                events.splice(i, 1);
                break;
            }
        }
    };
} else {
    console.error("Main calendar module doesn't exists!")
}