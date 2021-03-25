import React, {useEffect, useState} from 'react';

import MediaQuery from 'react-responsive';
import {useHistory} from 'react-router-dom';
import moment from 'moment';

import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';
import {checkAuthenticated} from "../auth/CheckAuthenticated";

export function DeleteAvailabilityScreen(props) {
    return (
        <div className="TopLevelContainer">

            <Header/>

            <MediaQuery minWidth={765}>
                <DeleteAvailabilityBody
                    location={props.location}
                    pageBorderClass={"PageBorder"}
                    underlineClass={"Underline"}/>
            </MediaQuery>

            <MediaQuery maxWidth={765}>
                <DeleteAvailabilityBody
                    location={props.location}
                    pageBorderClass={"PageBorder2"}
                    underlineClass={"Underline2"}/>
            </MediaQuery>

            <Bottom/>

        </div>
    );
}

function DeleteAvailabilityBody(props) {
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
        <header className={props.pageBorderClass}>
            <Title
                titleText={"View Availability"}
                underlineClass={props.underlineClass}/>

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

        </header>
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
