import React, {useEffect, useState} from 'react';

import {useHistory} from 'react-router-dom';
import moment from 'moment';

import {Header} from '../header/Header';
import {checkAuthenticated} from "../auth/CheckAuthenticated";

// TODO here we should be able to choose between modifying (put), creating (post) and deleteing (delete)
//      I guess that means this is the availabilityscreen compononent
export function DeleteAvailabilityScreen(props) {

    const baseUrl = 'https://k2ajudwpt0.execute-api.us-west-2.amazonaws.com/prod/'

    const history = useHistory();

    const [user, setUser] = useState(undefined)
    useEffect(() => {
        checkAuthenticated(() => history.push("/anonymous-user"), setUser);
    }, [
        history, setUser
    ]);

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
        <>
            <Header/>

            <h2>
                Delete Availability
            </h2>

            <AvailabilityPiece
                header={"Subjects:"}
                content={availability.subjects}
            />

            <AvailabilityPiece
                header={"Start Time:"}
                content={moment(availability.startTime).format('MMMM Do YYYY, h:mm:ss a')}
            />

            <AvailabilityPiece
                header={"End Time:"}
                content={moment(availability.endTime).format('MMMM Do YYYY, h:mm:ss a')}
            />

            <button onClick={onClickDelete}>
               Delete 
            </button>

            <button onClick={onCancel}>
               Cancel 
            </button>
        </>
    );
}

function AvailabilityPiece(props) {
    return (
        <>
            <h4>
                {props.header}
            </h4>
            <p>
                {props.content}
            </p>
        </>
    );
}
