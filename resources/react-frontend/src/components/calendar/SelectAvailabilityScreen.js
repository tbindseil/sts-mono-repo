import React, {useCallback, useEffect, useState} from 'react';

import moment from 'moment';
import MediaQuery from 'react-responsive';
import {useHistory} from 'react-router-dom';

import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';
import {checkAuthenticated} from "../auth/CheckAuthenticated";

export function SelectAvailabilityScreen(props) {
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

// TODO cool idea, allow start time and subject to be selectable here
function CreateAvailabilityBody(props) {
    const availabilityLambdaUrl = 'https://k2ajudwpt0.execute-api.us-west-2.amazonaws.com/prod'
    // const availabilityRequestLambdaUrl = 'https://04c0w1j888.execute-api.us-west-2.amazonaws.com/prod/';
    const history = useHistory();

    const stateProps = props.location.state;

    // if there are no state props, we in trouble..
    const startTime = stateProps.startTime;
    const subject = stateProps.subject;

    const [user, setUser] = useState(undefined)
    useEffect(() => {
        checkAuthenticated(() => history.push("/anonymous-user"), setUser);
    }, [
        history, setUser
    ]);

    const [availabilities, setAvailabilities] = useState([]);

    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [loading, setLoading] = useState(false);

    const getAvailabilities = useCallback(
        (user) => {
            if (!user) {
                return;
            }

            // startTime and endTime are 12:00:00 am of sunday morning and 11:59:59 of saturday night for week of selectedDate
            // could be improved by only getting for 1 day for small screen
            const requestStartTime = moment(startTime).toDate();
            const requestEndTime = moment(startTime).add('minute', 30).toDate();
            const url = new URL(availabilityLambdaUrl)
            const getAvailInput = {
                username: "*",
                subject: subject,
                startTime: requestStartTime,
                endTime: requestEndTime
            };

            // TODO need to show time slot, all the more reason to make it searchable here too

            url.searchParams.append('getAvailInput', JSON.stringify(getAvailInput));

            const tokenString = 'Bearer ' + user.signInUserSession.idToken.jwtToken;
            fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': tokenString
                },
            })
                .then(res => res.json())
                .then((result) => {
                    const availabilitiesWithDates = []
                    for (const [id, avail] of Object.entries(result)) {
                        availabilitiesWithDates.push({
                            endTime: moment.utc(avail.endTime).local().toDate(),
                            startTime: moment.utc(avail.startTime).local().toDate(),
                            subjects: avail.subjects,
                            tutor: avail.tutor,
                            id: id
                        });
                    }
                    setAvailabilities(availabilitiesWithDates);
                },
                    // Note: it's important to handle errors here
                    // instead of a catch() block so that we don't swallow
                    // exceptions from actual bugs in components.
                    (error) => {
                        setFailed(true);
                        var message = "1Error getting availabilties";
                        if (error.message) {
                            message += ": " + error.message;
                        }
                        setErrorMessage(message);
                    })
                .catch(err => { // TODO this code is wet as fuck
                    setFailed(true);
                    var message = "2Error getting availabilties";
                    if (err.message) {
                        message += ": " + err.message;
                    }
                    setErrorMessage(message);
                });
        },
        [startTime, subject]
    );

    useEffect(() => {
        getAvailabilities(user);
    }, [
        user, getAvailabilities
    ]);

    const onCancel = () => {
        history.push({
            pathname: "/calendar",
            state: {
                selectedDate: startTime
            }
        });
    };


    // now show availabilities
    // for each avail, we want to show
    // start | end | tutor | subjects | status | button


    return (
        <header className={props.pageBorderClass}>
            <Title
                titleText={"Select Availability"}
                underlineClass={props.underlineClass}/>

            <table className="AvailabilityForm">

                <tr>
                    <th>
                        Start
                    </th>
                    <th>
                        End
                    </th>
                    <th>
                        Tutor
                    </th>
                    <th>
                        Subjects
                    </th>
                    <th>
                        Status
                    </th>
                    <th>
                        Button
                    </th>
                </tr>

                {
                    availabilities.map(avail => {
                        return (
                            <tr>
                                <td>
                                    {moment(avail.startTime).format("LT")}
                                </td>
                                <td>
                                    {moment(avail.endTime).format("LT")}
                                </td>
                                <td>
                                    {avail.tutor}
                                </td>
                                <td>
                                    {avail.subjects}
                                </td>
                                <td>
                                    Status - TODO
                                </td>
                                <td>
                                    <button>
                                        TODO
                                    </button>
                                </td>
                            </tr>
                        );
                    })
                }

                <tr>
                    <td>
                        <button onClick={onCancel}>
                            Cancel
                        </button>
                    </td>
                    <td>
                        paragraph
                    </td>
                </tr>
            </table>

            <div className="Centered MaxWidth">
                { failed &&
                    <p className="ErrorMessage">{errorMessage}</p>
                }
            </div>

        </header>
    );
}
