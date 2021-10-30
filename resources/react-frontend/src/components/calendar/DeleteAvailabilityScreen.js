import React, {useState} from 'react';

import {useHistory} from 'react-router-dom';
import moment from 'moment';

import {BaseScreen} from '../base-components/BaseScreen';

export function DeleteAvailabilityScreen(props) {
    const baseUrl = 'https://k2ajudwpt0.execute-api.us-west-2.amazonaws.com/prod/'

    const history = useHistory();

    const [user, setUser] = useState(undefined)

    const deleteAvailability = async () => {

        const url = baseUrl + availability.id;
        const tokenString = 'Bearer ' + user.signInUserSession.idToken.jwtToken;
        const response = await fetch(url, {
            method: 'DELETE',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': tokenString
            },
        });
        return response;
    }

    const onClickDelete = async () => {
        await deleteAvailability();
        history.push({
            pathname: "/my-calendar",
            state: {
                selectedDate: availability.startDate
            }
        });
    };

    const onCancel = () => {
        history.push({
            pathname: "/my-calendar",
            state: {
                selectedDate: availability.startDate
            }
        });
    };

    const stateProps = props.location.state;
    if (!stateProps || !stateProps.availability) {
        return <h2>Whoops, no availability provided</h2>
    }
    const availability = stateProps.availability;

    return (
        <BaseScreen
            titleText={"View Availability"}
            needAuthenticated={true}
            setUser={setUser}>

            <table className="AvailabilityForm">
                <tr>
                    <AvailabilityPiece
                        header={"Subjects:"}
                        content={availability.subjects}
                    />
                </tr>
                <tr>
                    <AvailabilityPiece
                        header={"Start Time:"}
                        content={moment(availability.startTime).format('MMMM Do YYYY, h:mm:ss a')}
                    />
                </tr>
                <tr>
                    <AvailabilityPiece
                        header={"End Time:"}
                        content={moment(availability.endTime).format('MMMM Do YYYY, h:mm:ss a')}
                    />
                </tr>
                <tr>
                    <td>
                        <button onClick={onClickDelete}>
                            Delete
                        </button>
                    </td>
                    <td>
                        <button onClick={onCancel}>
                            Cancel
                        </button>
                    </td>
                </tr>
            </table>

        </BaseScreen>
    );
}

function AvailabilityPiece(props) {
    return (
        <>
            <td>
                {props.header}
            </td>
            <td>
                {props.content}
            </td>
        </>
    );
}
