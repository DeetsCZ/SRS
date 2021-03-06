var REFRESH_INTERVAL = 10000;
function FrontCalendarCtrl($scope, $http, $q, $timeout) {
    $scope.option = ''; // indexovane bloky - pro snadne vyhledavani a prirazovani
    $scope.event = null; // udalost se kterou prave pracuji
    $scope.config = null; // konfiguracni nastaveni pro kalendar
    $scope.mandatory_unsigned_programs_count = 0;


    var api_path = basePath + '/api/program/';
    $scope.startup = function () {
        var promise, promisses = [];
        promise = $http.get(api_path + "getblocks", {})
            .success(function (data, status, headers, config) {
                $scope.options = data;
            }).error(function (data, status, headers, config) {
                $scope.status = status;
            });
        promisses.push(promise);

        promise = $http.get(api_path + "getprograms?userAttending=1&onlyAssigned=1&userAllowed=1", {})
            .success(function (data, status, headers, config) {
                $scope.events = data;
            }).error(function (data, status, headers, config) {
                $scope.status = status;
            });
        promisses.push(promise);

        promise = $http.get(api_path + "./getcalendarconfig", {})
            .success(function (data, status, headers, config) {
                $scope.config = data;

            }).error(function (data, status, headers, config) {
                $scope.status = status;
            });
        promisses.push(promise);

        //pote co jsou vsechny inicializacni ajax requesty splneny
        $q.all(promisses).then(function () {
            angular.forEach($scope.events, function (event, key) {
                event.block = $scope.options[event.block];
                if (event.mandatory == true && event.attends == false) {
                    $scope.mandatory_unsigned_programs_count++;
                }

                for (i = $scope.events.length - 1; i >= 0; i--) {
                    $scope.events[i].blocked = false;
                }

                for (i = $scope.events.length - 1; i >= 0; i--) {
                    otherEvent = $scope.events[i];
                    if (otherEvent.id == event.id)
                        continue;
                    if (otherEvent.attends == true && otherEvent.blocks.indexOf(event.id) != -1) {
                        event.blocked = true;
                        break;
                    }
                }

                setColorFront(event);
            });
            bindCalendar($scope);
        });
    }

    $scope.startup();

    $scope.attend = function (event) {
        $http.post(api_path + "attend/" + event.id)
            .success(function (data, status, headers, config) {
                flashMessage(data['message'], data['status']);
                if (data['status'] == 'success') {
                    event.attends = true;

                    if (event.mandatory == true) {
                        $scope.mandatory_unsigned_programs_count--;
                    }

                    event.attendees_count = data.event.attendees_count;

                    for (i = $scope.events.length - 1; i >= 0; i--) {
                        $scope.events[i].blocked = false;
                    }

                    for (i = $scope.events.length - 1; i >= 0; i--) {
                        for (j = $scope.events.length - 1; j >= 0; j--) {
                            if (i == j) continue;
                            if ($scope.events[i].attends == true && $scope.events[i].blocks.indexOf($scope.events[j].id) != -1)
                                $scope.events[j].blocked = true;
                        }
                    }

                    for (i = $scope.events.length - 1; i >= 0; i--) {
                        setColorFront($scope.events[i]);
                    }
                }
                $('#calendar').fullCalendar('updateEvent', event);
            }).error(function (data, status, headers, config) {
                $scope.status = status;
            });
        $('#blockModal').modal('hide');
    }

    $scope.unattend = function (event) {
        $http.post(api_path + "unattend/" + event.id)
            .success(function (data, status, headers, config) {
                flashMessage(data['message'], data['status']);
                if (data['status'] == 'success') {
                    event.attends = false;
                    event.attendees_count = data.event.attendees_count;
                    if (event.mandatory == true) {
                        $scope.mandatory_unsigned_programs_count++;
                    }

                    for (i = $scope.events.length - 1; i >= 0; i--) {
                        $scope.events[i].blocked = false;
                    }

                    for (i = $scope.events.length - 1; i >= 0; i--) {
                        for (j = $scope.events.length - 1; j >= 0; j--) {
                            if (i == j) continue;
                            if ($scope.events[i].attends == true && $scope.events[i].blocks.indexOf($scope.events[j].id) != -1)
                                $scope.events[j].blocked = true;
                        }
                    }

                    for (i = $scope.events.length - 1; i >= 0; i--) {
                        setColorFront($scope.events[i]);
                    }
                }
                $('#calendar').fullCalendar('updateEvent', event);
            }).error(function (data, status, headers, config) {
                $scope.status = status;
            });
        $('#blockModal').modal('hide');
    }


    $scope.refreshDialog = function () {
        $scope.$apply();
    }
}

function bindCalendar(scope) {
    var local_config = {
        editable:false,
        droppable:false,
        events:scope.events,
        year:scope.config.year,
        month:scope.config.month,
        date:scope.config.date,
        selectable:false,
        selectHelper:false,
        seminarLength:scope.config.seminar_duration,
        firstDay:scope.config.seminar_start_day,


        eventClick:function (event, element) {
            scope.event = event;
            scope.refreshDialog();
            $('#blockModal').modal('show');
        },

        eventMouseout:function (event, jsEvent, view) {
            $('.popover').fadeOut(); //hack popover obcas nezmizi
        },

        eventRender:function (event, element) {
            var options = {}
            options.html = true;
            options.trigger = 'hover';
            options.title = event.title;
            options.content = '';
            options.placement = 'bottom';
            options.container = 'body';
            if (event.block != null && event.block != undefined) {
                options.content += "<ul class='no-bullets no-margin'>";
                options.content += "<li><span>Lektor:</span> " + event.block.lector + "</li>";
                options.content += "<li><span>Místnost:</span> " + event.block.room + "</li>";
                options.content += "<li><span>Obsazenost:</span> " + event.attendees_count + "/" + event.block.capacity + "</li>";
                options.content += "<li><span>Kategorie:</span> " + event.block.category + "</li>";
                options.content += "</ul>";
                if (event.block.perex != null) {
                    options.content += "<p>" + event.block.perex + "</p>";
                }
            }

            element.popover(options);
            element.find('.fc-event-title').append('<span style="float: right;" class="ui-icon ui-icon-triangle-1-ne"></span>')

        }
    }

    var calendar = $('#calendar').fullCalendar(jQuery.extend(local_config, localization_config));
}




