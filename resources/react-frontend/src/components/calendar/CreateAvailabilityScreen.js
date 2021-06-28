import React, {useEffect, useState} from 'react';

import MediaQuery from 'react-responsive';
import {useHistory} from 'react-router-dom';
import moment from 'moment';

import Multiselect from 'multiselect-react-dropdown'; // TODO should this just be a drop down also?
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
        const timeString = data.value;
        const splitTime = timeString.split(":");
        const splitSplitTime = splitTime[1].split(" ");
        const minutes = splitSplitTime[0];
        const amOrPm = splitSplitTime[1];
        let hours = splitTime[0];
        hours = hours % 12;
        hours = amOrPm === 'PM' ? hours + 12 : hours;

        const asMoment = moment();
        asMoment.set('minutes', minutes);
        asMoment.set('hours', hours);

        setStartTime(asMoment);
    };

    useEffect(() => {
        const rightNow = moment();
        const isToday = moment(day).isSame(rightNow, "day");
        if (isToday) {
            const snapped = snapDownTo30Min(rightNow);

            if (startTime.hour() < rightNow.hour()
                || (startTime.hour() === rightNow.hour() && startTime.minute() < snapped)) {
                const newStartTime = moment(startTime).set('hour', rightNow.hour()).set('minute', snapped);
                setStartTime(newStartTime);
            }
        }
    }, [day, startTime]);

    const [endTime, setEndTime] = useState(moment().set('minute', snapDownTo30Min(moment())).add('minute', 30));
    const handleChangeEndTime = (event, data) => {
        const timeString = data.value;
        const splitTime = timeString.split(":");
        const splitSplitTime = splitTime[1].split(" ");
        const minutes = parseInt(splitSplitTime[0]);
        const amOrPm = splitSplitTime[1];
        const modulatedHours = parseInt(splitTime[0]) % 12;
        const hours = amOrPm === 'PM' ? modulatedHours + 12 : modulatedHours;

        const asMoment = moment();
        asMoment.set('minute', minutes);
        asMoment.set('hour', hours);

        setEndTime(asMoment);
    };

    useEffect(() => {
        // 12 AM is tomorrow, and that's the latest end possible, no need to move it back
        if (endTime.hours() === 0 && endTime.minutes() === 0) {
            return;
        }

        if (endTime.hours() < startTime.hours()
            || (endTime.hours() === startTime.hours() && endTime.minutes() <= startTime.minutes())) {
            let newEndTime = moment(startTime);
            newEndTime.add('minutes', 30);
            setEndTime(newEndTime);
        }
    }, [startTime, endTime]);


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

        const end = moment(initial).startOf('day').add(1, 'day').add(29, 'minute');
        return enumerate30MinOptions(current, end);
    };

    const enumerate30MinOptions = (start, end) => {
        let current = moment(start);
        let options = [];
        while (current < end) {
            const timeStr = current.format("LT");
            options.push({
                key: timeStr,
                text: timeStr,
                value: timeStr,
            });

            current.add(30, 'minutes');
        }

        return options;
    };

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
                            value={startTime.format('LT')}
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
                        <Dropdown
                            options={makeEndTimeOptions()}
                            value={endTime.format('LT')}
                            onChange={handleChangeEndTime}
                            fluid
                            selection
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
