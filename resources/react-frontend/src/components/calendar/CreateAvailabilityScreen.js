import React, {useEffect, useState} from 'react';

import MediaQuery from 'react-responsive';
import {useHistory} from 'react-router-dom';
import moment from 'moment';

import Multiselect from 'multiselect-react-dropdown';
import Select from "react-dropdown-select";
import {Dropdown} from 'semantic-ui-react';

import subjects from '../../configs/subjects';

import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';
import {checkAuthenticated} from "../auth/CheckAuthenticated";

export function CreateAvailabilityScreen(props) {
    return (
        <div className="TopLevelContainer">

            <Header/>

            <MediaQuery minWidth={765}>
                <CreateAvailabilityBody
                    location={props.location}
                    pageBorderClass={"PageBorder"}
                    underlineClass={"Underline"}/>
            </MediaQuery>

            <MediaQuery maxWidth={765}>
                <CreateAvailabilityBody
                    location={props.location}
                    pageBorderClass={"PageBorder2"}
                    underlineClass={"Underline2"}/>
            </MediaQuery>

            <Bottom/>

        </div>
    );
}

function CreateAvailabilityBody(props) {
    const history = useHistory();

    const stateProps = props.location.state;
    const selectedDate = stateProps ? (stateProps.selectedDate ? stateProps.selectedDate : new Date()) : new Date();

    const baseUrl = 'https://k2ajudwpt0.execute-api.us-west-2.amazonaws.com/prod'

    const [user, setUser] = useState(undefined)
    useEffect(() => {
        checkAuthenticated(() => history.push("/anonymous-user"), setUser);
    }, [
        history, setUser
    ]);

    // time stuff
    const snapDownTo30Min = (initial) => {
        if (initial.minute() < 30) {
            return 0;
        } else {
            return 30;
        }
    }

    const [day, setDay] = useState(moment().toDate());
    const handleChangeDay = (event) => {
        // if date in past selected, set to today
        const rightNow = moment();
        const asMoment = moment(event.target.value);
        if (asMoment.year() < rightNow.year()
            || (asMoment.year() === rightNow.year() && asMoment.month() < rightNow.month())
            || (asMoment.year() === rightNow.year() && asMoment.month() === rightNow.month() && asMoment.date() < rightNow.date())) {
            asMoment.set('year', rightNow.year());
            asMoment.set('month', rightNow.month());
            asMoment.set('date', rightNow.date());
        }
        setDay(asMoment.toDate());

        // checkStartTime();
    }

    const [startTime, setStartTime] = useState(moment().set('minute', snapDownTo30Min(moment())));
    const handleChangeStartTime = (event, data) => {
        /*console.log('start handleChangeStartTime');
        console.log('data is:');
        console.log(data);
        // let newStartTime = moment();
        // newStartTime.set(data, 'LT');
        let newStartTime = moment(data, 'h:mm a');
        console.log('newStartTime is:');
        console.log(newStartTime);
        console.log("newStartTime.hour() is");
        console.log(newStartTime.hour());
        console.log("newStartTime.minutes() is");
        console.log(newStartTime.minutes());
        let rightNow = moment();
        rightNow.set(newStartTime.hour(), 'hour');
        rightNow.set(newStartTime.minute(), 'minute');
        console.log("rightNow is:");
        console.log(rightNow);
        setStartTime(rightNow);
        console.log('end handleChangeStartTime');*/
        const timeString = data.value;
        const splitTime = timeString.split(":");
        const splitSplitTime = splitTime[1].split(" ");
        const minutes = splitSplitTime[0];
        const amOrPm = splitSplitTime[1];
        let hours = splitTime[0];
        hours = hours % 12;
        hours = amOrPm === 'PM' ? hours + 12 : hours;

        const asMoment = moment();
        console.log("minutes is:");
        console.log(minutes);
        console.log('hours is:');
        console.log(hours);
        asMoment.set('minutes', minutes);
        asMoment.set('hours', hours);

        setStartTime(asMoment);

        // checkEndTime();
    };

    useEffect(() => {
        // console.log("day is:");
        // console.log(day);

        const rightNow = moment();
        const isToday = moment(day).isSame(rightNow, "day");
        if (isToday) {
            // console.log("is today");
            const snapped = snapDownTo30Min(rightNow);

            if (startTime.hour() < rightNow.hour()
                || (startTime.hour() === rightNow.hour() && startTime.minute() < snapped)) {
                // console.log("next if");
                const newStartTime = moment(startTime).set('hour', rightNow.hour()).set('minute', snapped);
                // console.log("newStartTime is:");
                // console.log(newStartTime);
                setStartTime(newStartTime);
                // checkEndTime();
            }
        }

    }, [day, startTime]);

    const checkStartTime = () => {
        const rightNow = moment();
        const isToday = moment(day).isSame(rightNow, "day");
        if (isToday) {
            const snapped = snapDownTo30Min(rightNow);

            if (startTime.hour() < rightNow.hour()
                || (startTime.hour() === rightNow.hour() && startTime.minute() < snapped)) {
                const newStartTime = moment(startTime).set('hour', rightNow.hour()).set('minute', snapped);
                setStartTime(newStartTime);
                checkEndTime();
            }
        }
    };

    const [endTime, setEndTime] = useState(moment().set('minute', snapDownTo30Min(moment())).add('minute', 30));
    const handleChangeEndTime = (selected) => {
        const timeString = selected[0].label;
        const splitTime = timeString.split(":");
        const splitSplitTime = splitTime[1].split(" ");
        const minutes = splitSplitTime[0];
        const amOrPm = splitSplitTime[1];
        const hours = amOrPm === 'PM' ? splitTime[0] + 12 : splitTime[0];

        const asMoment = moment();
        asMoment.set('minutes', minutes);
        asMoment.set('hours', hours);

        setEndTime(asMoment);
    };

    const checkEndTime = () => {
        // console.log("checkEndTime");
        // console.log("endTime is:");
        // console.log(endTime);
        // console.log("startTime is:");
        // console.log(startTime);
        //
        // TJTAG
        // seems like start time is not being updated in by the time this is called
        //
        // make sure end time is after start time, if now, set to next available time slot
        if (endTime.hours() < startTime.hours()
            || (endTime.hours() === startTime.hours && endTime.minutes() < startTime.minutes())) {
            // set endtime to startTime, then add 30 minutes
            let newEndTime = moment(startTime);
            newEndTime.add('minutes', 30);
            setEndTime(newEndTime);
            // console.log("newEndtime is:");
            // console.log(newEndTime);
        }
    };

    const postAvailability = async () => {
        const startTime = moment(day);
        const endTime = moment();
        const availability = {
            subjects: selectedSubjects.map(subject => subject.name).join(','),
            startTime: startTime,
            endTime: endTime,
            tutor: user.username
        };

        const tokenString = 'Bearer ' + user.signInUserSession.idToken.jwtToken;
        const response = await fetch(baseUrl, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': tokenString
            },
            body: JSON.stringify(availability)
        });
        return response;
    }

    const onFinish = async () => {
        await postAvailability();
        history.push({
            pathname: "/my-calendar",
            state: {
                selectedDate: selectedDate
            }
        });
    };

    const onCancel = () => {
        history.push({
            pathname: "/my-calendar",
            state: {
                selectedDate: selectedDate
            }
        });
    };

    const [selectedSubjects, setSelectedSubjects] = useState([]);

    const onSubjectSelect = (selectedList, selectedItem) => {
        setSelectedSubjects(selectedList);
    };

    const onSubjectRemove = (selectedList, selectedItem) => {
        setSelectedSubjects(selectedList);
    };

    const makeStartTimeOptions = () => {
        // console.log can I use this in set day?
        // probably, if isToday or asMoment > rightNow
        const isToday = moment(day).isSame(new Date(), "day");

        let initial = moment(day);
        if (isToday) {
            const snappedMinute = snapDownTo30Min(initial);
            initial.set('minute',  snappedMinute);
        } else {
            initial.set('hour', 0);
            initial.set('minute', 0);
        }

        let options = [];
        let index = 0;
        let current = moment(initial);
        while (current.day() === initial.day()) {
            const hour = current.hour() % 12 === 0 ? 12 : current.hour() % 12;
            const minutes = current.minute() === 0 ? '00' : '30';
            const amOrPm = current.hour() >= 12 ? 'PM' : 'AM';
            options.push({
                label: `${hour}:${minutes} ${amOrPm}`,
                key: `${hour}:${minutes} ${amOrPm}`,
                text: `${hour}:${minutes} ${amOrPm}`,
                value: `${hour}:${minutes} ${amOrPm}`,
                id: index
            });

            current.add(30, 'minutes');
            ++index;
        }

        return options;
    };

    const makeEndTimeOptions = () => {
        // based off start time,
        // start with next one after start Time and generate up to 12 AM
        const initial = moment(startTime);
        let current = moment(startTime);
        current.add('minute', 30);

        let index = 0;
        let options = []
        while (current.day() === initial.day()) {
            const hour = current.hour() % 12 === 0 ? 12 : current.hour() % 12;
            const minutes = current.minute() === 0 ? '00' : '30';
            const amOrPm = current.hour() >= 12 ? 'PM' : 'AM';
            options.push({
                label: `${hour}:${minutes} ${amOrPm}`,
                id: index
            });

            current.add(30, 'minutes');
            ++index;
        }

        return options;
    };

    const getStartTimeValue = () => {
        // TODO this could easily just be a formatting of the moment
        console.log('start getStartTimeValue');
        console.log("startTime is:");
        console.log(startTime);
        const hour = startTime.hour() % 12 === 0 ? 12 : startTime.hour() % 12;
        const minutes = startTime.minute() === 0 ? '00' : '30';
        const amOrPm = startTime.hour() >= 12 ? 'PM' : 'AM';
        console.log("returnign is:");
        console.log(`${hour}:${minutes} ${amOrPm}`);
        console.log('end getStartTimeValue');
        return `${hour}:${minutes} ${amOrPm}`;
    }

    const getEndTimeValue = () => {
        // console.log("getEndTimeValue");
        const hour = endTime.hour() % 12 === 0 ? 12 : endTime.hour() % 12;
        const minutes = endTime.minute() === 0 ? '00' : '30';
        const amOrPm = endTime.hour() >= 12 ? 'PM' : 'AM';
        return [{
            label: `${hour}:${minutes} ${amOrPm}`
        }];
    }

    return (
        <header className={props.pageBorderClass}>
            <Title
                titleText={"CreateAvailability"}
                underlineClass={props.underlineClass}/>

            <table className="AvailabilityForm">
                <tr>
                    <td>
                        <label for="subject">
                            Subjects
                        </label>
                    </td>
                    <td>
                        <Multiselect
                            options={subjects.map((subject, index) => { return { name: subject, id: index}}) }
                            selectedValues={null} 
                            onSelect={onSubjectSelect}
                            onRemove={onSubjectRemove}
                            displayValue="name"
                            closeOnSelect={false}
                        />
                    </td>
                </tr>
                <tr>
                    <td>
                        <label for="day">
                            Day:
                        </label>
                    </td>
                    <td>
                        <input
                            onChange={handleChangeDay}
                            type="date"
                            name="day"
                            value={moment(day).format("YYYY-MM-DD")}
                        />
                    </td>
                </tr>
                <tr>
                    <td>
                        <label for="startTime">
                            Start Time:
                        </label>
                    </td>
                    <td>
                        <Dropdown
                            options={makeStartTimeOptions()}
                            value={console.log('start time is:') || console.log(startTime) || console.log(startTime.format('LT')) || startTime.format('LT')}
                            onChange={handleChangeStartTime}
                            fluid
                            selection
                            multi={false}
                        />
                    </td>
                </tr>
                <tr>
                    <td>
                        <label for="endTime">
                            End Time:
                        </label>
                    </td>
                    <td>
                        <Select
                            options={makeEndTimeOptions()}
                            values={getEndTimeValue()}
                            onChange={handleChangeEndTime}
                            multi={false}
                        />
                    </td>
                </tr>
                <tr>
                    <td>
                        <button onClick={onCancel}>
                            Cancel
                        </button>
                    </td>
                    <td>
                        <button onClick={onFinish}>
                            Create Availability
                        </button>
                    </td>
                </tr>
            </table>

        </header>
    );
}
