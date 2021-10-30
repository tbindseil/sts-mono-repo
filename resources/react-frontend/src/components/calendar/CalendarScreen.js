import React, {useCallback, useEffect, useMemo, useState} from 'react';
import MediaQuery from 'react-responsive';
import {useHistory} from 'react-router-dom';

import moment from 'moment';

import {Dropdown} from 'semantic-ui-react';

import './Calendar.css';
import subjects from '../../configs/subjects';
import {Calendar} from './Calendar';
import {BigScreenNavigationTable, SmallScreenNavigationTable, goToDate} from './NavigationTable';
import {makeGetAvailabilities} from '../fetch-enhancements/fetch-call-builders';
import {BaseScreen} from '../base-components/BaseScreen';
import {ScreenSizeConfigurable} from '../base-components/ScreenSizeConfigurable';

// using a two layered "MediaQueryWrapper" here
export function CalendarScreen(props) {
    const history = useHistory();

    const [user, setUser] = useState(undefined)

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

            const successHandler = (result) => {
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
            };

            const startTime = moment(selectedDate).startOf('week').toDate();
            const endTime = moment(selectedDate).endOf('week').toDate();
            const call = makeGetAvailabilities({
                user: user,
                username: "*",
                subject: selectedSubject,
                startTime: startTime,
                endTime: endTime,
                successHandler: successHandler,
                setFailed: setFailed,
                setErrorMessage: setErrorMessage
            });
            call();
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
        <BaseScreen
            titleText={"Calendar Screen"}
            needAuthenticated={true}
            setUser={setUser}>

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

            <ScreenSizeConfigurable
                bigScreenClassName={"BigScreenNavigationDatePicker"}
                smallScreenClassName={"SmallScreenNavigationDatePicker"}>
                <div className={props.datePickerClass}>
                    <label for="jumpToDate">Jump to Date:</label>
                    <input onChange={handleChangeJumpToDate} type="date" name="jumpToDate" value={moment(jumpToDate).format("YYYY-MM-DD")}/>
                    <button onClick={onClickJumpToDate}>Go</button>
                </div>
            </ScreenSizeConfigurable>

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

        </BaseScreen>
    );
}
