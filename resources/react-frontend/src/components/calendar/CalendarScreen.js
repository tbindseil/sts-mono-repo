import React, {useCallback, useEffect, useMemo, useState} from 'react';
import MediaQuery from 'react-responsive';
import {useHistory} from 'react-router-dom';

import moment from 'moment';

import {Dropdown} from 'semantic-ui-react';

import './Calendar.css';
import subjects from '../../configs/subjects';
import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';
import {checkAuthenticated} from "../auth/CheckAuthenticated";
import {Calendar} from './Calendar';
import {BigScreenNavigationTable, SmallScreenNavigationTable, goToDate} from './NavigationTable';

// using a two layered "MediaQueryWrapper" here
export function CalendarScreen(props) {
    return (
        <div>
            <Header/>

            <MediaQuery minWidth={765}>
                <CalendarBody
                    location={props.location}
                    pageBorderClass={"PageBorderCalendar"}
                    underlineClass={"Underline"}
                    datePickerClass={"BigScreenNavigationDatePicker"}/>
            </MediaQuery>

            <MediaQuery maxWidth={765}>
                <CalendarBody
                    location={props.location}
                    pageBorderClass={"PageBorder2"}
                    underlineClass={"Underline2"}
                    datePickerClass={"SmallScreenNavigationDatePicker"}/>
            </MediaQuery>

            <Bottom/>
        </div>
    );
}

function CalendarBody(props) {
    const baseUrl = 'https://k2ajudwpt0.execute-api.us-west-2.amazonaws.com/prod'

    const history = useHistory();

    const [user, setUser] = useState(undefined)
    useEffect(() => {
        checkAuthenticated(() => history.push("/anonymous-user"), setUser);
    }, [
        history, setUser
    ]);

    // based off stateProps.selectedDate
    const stateProps = props.location.state;
    const selectedDate = useMemo(() => { return stateProps ? (stateProps.selectedDate ? stateProps.selectedDate : new Date()) : new Date() }, [stateProps]);

    // it starts showing anything, is that even a problem?
    const [selectedSubject, setSelectedSubject] = useState('');

    const [availabilities, setAvailabilities] = useState([]);
    const getAvailabilities = useCallback(
        (user) => {
            if (!user) {
                return;
            }

            // startTime and endTime are 12:00:00 am of sunday morning and 11:59:59 of saturday night for week of selectedDate
            // could be improved by only getting for 1 day for small screen
            const startTime = moment(selectedDate).startOf('week').toDate();
            const endTime = moment(selectedDate).endOf('week').toDate();
            const url = new URL(baseUrl)
            const getAvailInput = {
                username: "*",
                subject: selectedSubject,
                startTime: startTime,
                endTime: endTime
            };
            console.log('getAvailInput is:');
            console.log(JSON.stringify(getAvailInput));
            url.searchParams.append('getAvailInput', JSON.stringify(getAvailInput));

            const tokenString = 'Bearer ' + user.signInUserSession.idToken.jwtToken;
            fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': tokenString
                },
            })
                .then(res => res.json())
                .then((result) => {
                    const availabilitiesWithDates = []
                    for (const [id, avail] of Object.entries(result)) {
                        availabilitiesWithDates.push({
                            endTime: moment.utc(avail.endTime).local().toDate(),
                            startTime: moment.utc(avail.startTime).local().toDate(),
                            subjects: avail.subjects,
                            tutor: avail.tutor,
                            id: id
                        });
                    }
                    setAvailabilities(availabilitiesWithDates);
                },
                    // Note: it's important to handle errors here
                    // instead of a catch() block so that we don't swallow
                    // exceptions from actual bugs in components.
                    (error) => {
                        setFailed(true);
                        var message = "1Error getting availabilties";
                        if (error.message) {
                            message += ": " + error.message;
                        }
                        setErrorMessage(message);
                    })
                .catch(err => { // TODO this code is wet as fuck
                    setFailed(true);
                    var message = "2Error getting availabilties";
                    if (err.message) {
                        message += ": " + err.message;
                    }
                    setErrorMessage(message);
                });
        },
        [selectedDate, selectedSubject]
    );

    useEffect(() => {
        getAvailabilities(user);
    }, [
        user, getAvailabilities
    ]);

    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // looks like defaults don't refresh when navigating to the same page
    const [jumpToDate, setJumpToDate] = useState(selectedDate);
    const handleChangeJumpToDate = (event) => {
        setJumpToDate(event.target.value);
    };

    const onClickJumpToDate = () => {
        goToDate(history, moment(jumpToDate).toDate(), "/calendar");
    };

    const makeSelectSubjectsOptions = () => {
        return subjects.map((subject, index) => { return { key: subject, text: subject, value: subject}});
    };

    const handleChangeSelectedSubject = (event, data) => {
        setSelectedSubject(data.value);
    };

    // visitor pattern? build all time slots
    // this is probably also best done as a callback that triggers whenever avails or selectedDate changes
    let timeSlots = [];
    let startOfBlock = moment(selectedDate).startOf('week');
    const endOfCalendar = moment(selectedDate).endOf('week');
    const arrOfFuncs = [];
    while (startOfBlock.isBefore(endOfCalendar)) { // this happens a lot...
        const endOfBlock = moment(startOfBlock).add('minute', 30);

        let currentAvailabilities = [];

        // could be optimised such that once an avail's end is before this loop's start, it gets ignored somehow

        // instead of just one, we potentially have several
        availabilities.forEach(a => {
            const startMoment = moment(a.startTime);
            const endMoment = moment(a.endTime);
            if ((startMoment.isBefore(startOfBlock) && endMoment.isAfter(endOfBlock))
                || (startMoment.isAfter(startOfBlock) && startMoment.isBefore(endOfBlock))
                || (endMoment.isAfter(startOfBlock) && endMoment.isBefore(endOfBlock))) {
                currentAvailabilities.push(a);
            }
        });

        const startOfBlockSnapShot = moment(startOfBlock).toDate();

        const onClickWithStartTime = function(subject, startTime) {
            history.push({
                pathname: "/select-availability",
                state: {
                    startTime: startTime,
                    subject: subject
                }
            })
        };
        arrOfFuncs.push(onClickWithStartTime);

        // seems like this needs to happen in two steps
        timeSlots.push(
            <div className="timeSlot FillGridCell">

                <button data={startOfBlockSnapShot} onClick={(event) => {
                    const startTime = event.target.getAttribute("data");
                    return onClickWithStartTime(selectedSubject, startTime);
                }}>
                    {`${currentAvailabilities.length} tutors available`}
                </button>
            </div>
        );

        startOfBlock.add('minute', 30);
    }

    return (
        <header className={props.pageBorderClass}>
            <Title
                titleText="Calendar Screen"
                underlineClass={props.underlineClass}/>

            { failed &&
                <p className="ErrorMessage">{errorMessage}</p>
            }

            <MediaQuery minWidth={765}>
                <BigScreenNavigationTable
                    selectedDate={selectedDate}
                    pathname="/calendar"/>
            </MediaQuery>
            <MediaQuery maxWidth={765}>
                <SmallScreenNavigationTable
                    selectedDate={selectedDate}
                    pathname="/calendar"/>
            </MediaQuery>

            <div className="SubjectSelect">
                <label>Select a Subject:</label>
                <Dropdown
                    options={makeSelectSubjectsOptions()}
                    value={selectedSubject}
                    onChange={handleChangeSelectedSubject}
                    selection
                    inline
                    multi={false}
                />
            </div>

            <div className={props.datePickerClass}>
                <label for="jumpToDate">Jump to Date:</label>
                <input onChange={handleChangeJumpToDate} type="date" name="jumpToDate" value={moment(jumpToDate).format("YYYY-MM-DD")}/>
                <button onClick={onClickJumpToDate}>Go</button>
            </div>

            <Calendar
                timeSlots={timeSlots}
                selectedDate={selectedDate}
            />

            <div className="BelowCalendar">
                <p>
                    Click somewhere on a given day to add tutoring availability to that day.
                    <br/>

                    Click on an existing availability to adjust or delete it
                </p>
            </div>

        </header>
    );
}
