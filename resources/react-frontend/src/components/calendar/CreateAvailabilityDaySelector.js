import React from 'react';
import moment from 'moment';

export function CreateAvailabilityDaySelector(props) {
    if (props.repeating) {
        return (
                <RepeatingDaySelector
                    selectedDays={props.selectedDays}
                    setSelectedDays={props.setSelectedDays}/>
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
    }

    const DaysOfTheWeek = [
        {
            short: 'S',
            long: 'Sunday',
            onClick: () => updateSelectedDays('Sunday')
        },
        {
            short: 'M',
            long: 'Monday',
            onClick: () => updateSelectedDays('Monday')
        },
        {
            short: 'T',
            long: 'Tuesday',
            onClick: () => updateSelectedDays('Tuesday')
        },
        {
            short: 'W',
            long: 'Wednesday',
            onClick: () => updateSelectedDays('Wednesday')
        },
        {
            short: 'T',
            long: 'Thursday',
            onClick: () => updateSelectedDays('Thursday')
        },
        {
            short: 'F',
            long: 'Friday',
            onClick: () => updateSelectedDays('Friday')
        },
        {
            short: 'S',
            long: 'Saturday',
            onClick: () => updateSelectedDays('Saturday')
        },
    ];

    return (
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
                            DaysOfTheWeek.map(d =>
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
    );
}
