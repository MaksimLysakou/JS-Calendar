function Event(name, dateTime, callback) {
    this.name = name;
    this.dateTime = dateTime;
    this.callback = callback;

    this.repeats = [];

    this.id = undefined;
    this.timeout = undefined;
}

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
            nextExecuteDate.setDate(currentDate.getDate() + nextExecuteDay - currentDate.getDay() + 7);
            return nextExecuteDate;
        }
    }
}

if(Calendar !== undefined){
    Calendar.startEventScheduler = function() {
        var events = Calendar.getAllEvents();

        events.forEach(function (event) {
            var nextExecute = getNextExecuteDate(event) - new Date();

                ( nextExecute > 0 ) &&
                ( event.timeout === undefined )) {

                event.timeout = setTimeout(event.callback, nextExecute);
            }
        });
    };
    Calendar.addEvent = function (event) {
        var events = Calendar.getAllEvents();
        var nextExecute = getNextExecuteDate(event) - new Date();

            event.timeout = setTimeout(event.callback, nextExecute);
        }

        event.id = events.reduce(function(maxId, currentEvent) {
                return (maxId < currentEvent.id) ? currentEvent.id : maxId;
            }, 0) + 1;
        events.push(event);

        if(Calendar.isSchedulerStarted == false){
            Calendar.isSchedulerStarted = true;
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
                        event.timeout = setTimeout(event.callback, nextExecute);
                    }
                }
            }
        });
    };
} else {
    console.error("Main calendar module doesn't exists!")
}