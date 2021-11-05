import React, {useState} from 'react';
import moment from 'moment';
import {Radio} from 'semantic-ui-react';

export function CreateAvailabilityDaySelector(props) {
    if (props.repeating) {
        return (
                <RepeatingDaySelector
                    handleChangeDay={props.handleChangeDay}
                    day={props.day}/>
        );
    } else {
        return (
            <DaySelector
                handleChangeDay={props.handleChangeDay}
                day={props.day}/>
        );
    }

    /*return ( // why doesn't that work?
        {
            props.repeating ?
                <RepeatingDaySelector
                    handleChangeDay={props.handleChangeDay}
                    day={props.day}/> :
                <DaySelector
                    handleChangeDay={props.handleChangeDay}
                    day={props.day}/>
        }
    );*/
}

function DaySelector(props) {
    return (
        <tr>
            <td>
                <label for="day">
                    Day:
                </label>
            </td>
            <td>
                <input
                    onChange={props.handleChangeDay}
                    type="date"
                    name="day"
                    value={moment(props.day).format("YYYY-MM-DD")}
                />
            </td>
        </tr>
    );
}

function RepeatingDaySelector(props) {
    const RepeatCadence = {
        MONTHLY: 'MONTHLY',
        WEEKLY: 'WEEKLY'
    };
    const [cadence, setCadence] = useState(RepeatCadence.WEEKLY);

    const handleCadenceChange = (event, {value}) => {
        switch (value) {
            case RepeatCadence.MONTHLY:
                setCadence(RepeatCadence.MONTHLY);
                break;
            case RepeatCadence.WEEKLY:
                setCadence(RepeatCadence.WEEKLY);
                break;
            default:
                console.log("invalid cadence selected:");
                console.log(value);
                break;
        }
    };


    return (
        <>
            <tr>
                <td>
                        <Radio
                            label='Monthly?'
                            name='radioGroup'
                            value={RepeatCadence.MONTHLY}
                            checked={cadence === RepeatCadence.MONTHLY}
                            onChange={handleCadenceChange}/>
                </td>
                <td>
                        <Radio
                            label='Weekly?'
                            name='radioGroup'
                            value={RepeatCadence.WEEKLY}
                            checked={cadence === RepeatCadence.WEEKLY}
                            onChange={handleCadenceChange}/>
                </td>
            </tr>
            <tr>
                {
                }
            </tr>
        </>
    );
}

// 7 squares in one row
function WeekSelector(props) {
    return (
        <>
            <td>
                <label>
                    does
                </label>
            </td>
            <td>
                <label>
                    does
                </label>
            </td>
        </>
    );
}

function MonthSelector(props) {
    return (
        <>
            <td>
                <label>
                    does
                </label>
            </td>
            <td>
                <label>
                    does
                </label>
            </td>
        </>
    );
}
