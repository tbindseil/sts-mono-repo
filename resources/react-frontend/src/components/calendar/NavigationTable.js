import React from 'react';
import {useHistory} from 'react-router-dom';
import moment from 'moment';

export function BigScreenNavigationTable(props) {
    const history = useHistory();
    const selectedDate = props.selectedDate;

    const onClickPreviousWeek = () => {
        goToDate(history, moment(selectedDate).subtract(7, "days").toDate(), props.pathName);
    };

    const onClickCurrentWeek = () => {
        goToDate(history, moment().toDate(), props.pathName);
    };

    const onClickNextWeek = () => {
        goToDate(history, moment(selectedDate).add(7, "days").toDate(), props.pathName);
    };

    return (
        <table className="BigScreenNavigationTable">
            <tr>
                <td>
                    <button onClick={onClickPreviousWeek}>
                        Previous Week
                    </button>
                    <button onClick={onClickCurrentWeek}>
                        Current Week
                    </button>
                    <button onClick={onClickNextWeek}>
                        Next Week
                    </button>
                </td>
            </tr>
        </table>
    );
}

export function SmallScreenNavigationTable(props) {
    const history = useHistory();
    const selectedDate = props.selectedDate;

    const onClickPreviousDay = () => {
        goToDate(history, moment(selectedDate).subtract(1, "days").toDate(), props.pathName);
    };

    const onClickCurrentDay = () => {
        goToDate(history, moment().toDate(), props.pathName);
    };

    const onClickNextDay = () => {
        goToDate(history, moment(selectedDate).add(1, "days").toDate(), props.pathName);
    };

    return (
        <table className="SmallScreenNavigationTable">
            <tr>
                <td>
                    <button onClick={onClickPreviousDay}>
                        Previous Day
                    </button>
                    <button onClick={onClickCurrentDay}>
                        Today
                    </button>
                    <button onClick={onClickNextDay}>
                        Next Day
                    </button>
                </td>
            </tr>
        </table>
    );
}

export function goToDate(history, date, pathname) {
    history.push({
        pathname: pathname,
        state: {
            selectedDate: date
        }
    });
}
