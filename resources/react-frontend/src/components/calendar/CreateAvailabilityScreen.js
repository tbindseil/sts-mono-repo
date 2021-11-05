import React, {useEffect, useState} from 'react';

import {useHistory} from 'react-router-dom';
import moment from 'moment';

import Multiselect from 'multiselect-react-dropdown'; // TODO should this just be a drop down also?
import {Checkbox, Dropdown} from 'semantic-ui-react';

import subjects from '../../configs/subjects';

import {CreateAvailabilityDaySelector} from './CreateAvailabilityDaySelector';
import {LoadingFormButton} from '../forms/FormButton';
import {apiFactory} from '../fetch-enhancements/fetch-call-builders';
import {BaseScreen} from '../base-components/BaseScreen';
import {ErrorRegistry} from '../base-components/ErrorRegistry';

export function CreateAvailabilityScreen(props) {
    const history = useHistory();

    const stateProps = props.location.state;
    const initialSelectedDate = stateProps ? (stateProps.selectedDate ? stateProps.selectedDate : new Date()) : new Date();
    let selectedDate = moment(initialSelectedDate).toDate();
    const tomorrow = moment().add('day', 1);
    const isBeforeTomorrow = moment(selectedDate).isBefore(tomorrow, "day");
    if (isBeforeTomorrow) {
        selectedDate = new Date();
    }

    const [user, setUser] = useState(undefined)

    // time stuff
    const snapDownTo30Min = (initial) => {
        if (initial.minute() < 30) {
            return 0;
        } else {
            return 30;
        }
    }

    const [day, setDay] = useState(moment(selectedDate).set('second', 0).toDate());
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
    }

    const [startTime, setStartTime] = useState(moment().set('minute', snapDownTo30Min(moment())));
    const handleChangeStartTime = (event, data) => {
        const asMoment = momentFromLTString(data.value);
        setStartTime(asMoment);
    };

    useEffect(() => {
        // if today, make sure that the start time is current 30 min block
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
        const asMoment = momentFromLTString(data.value);
        setEndTime(asMoment);
    };

    // how is this not in the library? timeString = HH:mm AM/PM
    const momentFromLTString = (timeString) => {
        const splitTime = timeString.split(":");
        const splitSplitTime = splitTime[1].split(" ");
        const minutes = parseInt(splitSplitTime[0]);
        const amOrPm = splitSplitTime[1];
        // hour 12 is weird..
        const modulatedHours = parseInt(splitTime[0]) % 12;
        const hours = amOrPm === 'PM' ? modulatedHours + 12 : modulatedHours;

        const asMoment = moment();
        asMoment.set('minute', minutes);
        asMoment.set('hour', hours);

        return asMoment;
    }

    useEffect(() => {
        // 12 AM is tomorrow, and that's the latest end possible, no need to move it back
        if (endTime.hours() === 0 && endTime.minutes() === 0) {
            return;
        }

        // set endTime to next slot if start time is now equal or ahead of it
        if (endTime.hours() < startTime.hours()
            || (endTime.hours() === startTime.hours() && endTime.minutes() <= startTime.minutes())) {
            let newEndTime = moment(startTime);
            newEndTime.add('minutes', 30);
            setEndTime(newEndTime);
        }
    }, [startTime, endTime]);

    // so what is actually happening?
    // first, create avail to post
    // then, make post call
    const onFinish = async () => {
        // TODO handle repeating?
        if (selectedSubjects.length === 0) {
            ErrorRegistry.getInstance().setFailed(true);
            ErrorRegistry.getInstance().setErrorMessage('Must select at least one subject');
            return;
        }

        const successHandler = (result) => {
            history.push({
                pathname: "/my-calendar",
                state: {
                    selectedDate: initialSelectedDate
                }
            });
        };

        setLoading(true);

        const call = apiFactory.makePostAvailability({
            day: day,
            startTime: startTime,
            endTime: endTime,
            selectedSubjects: selectedSubjects,
            user: user,
            successHandler: successHandler,
            finallyHandler: () => { setLoading(false) }
        });
        call();
    };

    const onCancel = () => {
        history.push({
            pathname: "/my-calendar",
            state: {
                selectedDate: initialSelectedDate
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
        // based off day
        // if today, current 30 min block start time, if after today, all times
        const isToday = moment(day).isSame(new Date(), "day");

        let initial = moment(day);
        if (isToday) {
            const snappedMinute = snapDownTo30Min(initial);
            initial.set('minute',  snappedMinute);
        } else {
            initial.set('hour', 0);
            initial.set('minute', 0);
        }

        const end = moment(initial).set('hour', 23).set('minute', 59);
        return enumerate30MinOptions(initial, end);
    };

    const makeEndTimeOptions = () => {
        // based off start time,
        // start with next one after start Time and generate up to 12 AM
        let initial = moment(startTime);
        initial.add('minute', 30);

        const end = moment(startTime).startOf('day').add(1, 'day').add(29, 'minute');
        return enumerate30MinOptions(initial, end);
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

    const [loading, setLoading] = useState(false);

    // so basically gonna just do a thin wrapper around
    // a bunch of postAvails
    const [repeating, setRepeating] = useState(false);
    const [selectedDays, setSelectedDays] = useState(new Set());
    const [numberOfWeeks, setNumberOfWeeks] = useState('');

    return (
        <BaseScreen
            titleText={"Create Availability"}
            needAuthenticated={true}
            setUser={setUser}
            errorPrefix={'Error creating availability'}>

            <div className={"Centered"}>
                <Checkbox label={"Repeating?"} onChange={() => setRepeating(!repeating)}/>
            </div>

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

                <CreateAvailabilityDaySelector
                    repeating={repeating}
                    day={day}
                    handleChangeDay={handleChangeDay}
                    selectedDays={selectedDays}
                    setSelectedDays={setSelectedDays}
                    setNumberOfWeeks={setNumberOfWeeks}
                    numberOfWeeks={numberOfWeeks}/>

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
                        <LoadingFormButton
                            loading={loading}
                            onClick={onFinish}
                            value={"Create Availability"}/>
                    </td>
                </tr>
            </table>

        </BaseScreen>
    );
}
