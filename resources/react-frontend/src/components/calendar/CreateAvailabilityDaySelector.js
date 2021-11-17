import React from 'react';
import moment from 'moment';

import {DaysOfTheWeek} from './DaysOfTheWeek';

export function CreateAvailabilityDaySelector(props) {
    if (props.repeating) {
        return (
            <RepeatingDaySelector
                selectedDays={props.selectedDays}
                setSelectedDays={props.setSelectedDays}
                numberOfWeeks={props.numberOfWeeks}
                setNumberOfWeeks={props.setNumberOfWeeks}/>
        );
    } else {
        return (
            <DaySelector
                handleChangeDay={props.handleChangeDay}
                day={props.day}/>
        );
    }
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

// take in 7 set repeating day functions, setMonday(true/false), etc
// what does the data look like?
// a list of week day
function RepeatingDaySelector(props) {
    const updateSelectedDays = (selectedDay) => {
        if (props.selectedDays.has(selectedDay)) {
            const newSet = new Set(props.selectedDays);
            newSet.delete(selectedDay);
            props.setSelectedDays(newSet);
        } else {
            const newSet = new Set(props.selectedDays);
            newSet.add(selectedDay);
            props.setSelectedDays(newSet);
        }
    };

    const ArmedDaysOfTheWeek = DaysOfTheWeek.map(dotw => ({ ...dotw, onClick: () => updateSelectedDays(dotw.long)}));

    return (
        <>

        <tr>
            <td>
                <label>
                    Weekly Schedule
                </label>
            </td>
            <td>
                <table className={"RepeatingDaySelector"}>
                    <tr>
                        {
                            ArmedDaysOfTheWeek.map(d =>
                                <td>
                                    <button onClick={d.onClick} className={props.selectedDays.has(d.long) ? 'SelectedDayOfWeek' : 'UnselectedDayOfWeek'}>
                                        {d.short}
                                    </button>
                                </td>
                            )
                        }
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td>
                <label>
                    Number of Weeks
                </label>
            </td>
            <td>
                <input value={props.numberOfWeeks} onChange={event => props.setNumberOfWeeks(event.target.value.replace(/\D/,''))}/>
            </td>
        </tr>

        </>
    );
}
