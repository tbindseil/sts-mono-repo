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
    const availabilityRequestLambdaUrl = 'https://04c0w1j888.execute-api.us-west-2.amazonaws.com/prod/';
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

    const [availabilities, setAvailabilities] = useState(new Map());
    const [statuses, setStatuses] = useState(new Map());
    const updateStatus = useCallback(
        (id, status) => {
            const currStatus = statuses.get(id);
            if (currStatus === status) {
                // base case
                return;
            }
            statuses.set(id, status);
            const newStatuses = new Map(statuses);
            setStatuses(newStatuses);
        },
        [statuses, setStatuses]
    );


    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [loading, setLoading] = useState(false);

    // TODO need to ignore own users availabilities
    // maybe I also need to consider that the user shouldn't be able to make requests while they have availabilities
    const getAvailabilities = useCallback(
        (user) => {
            if (!user) {
                return;
            }

            // startTime and endTime are 12:00:00 am of sunday morning and 11:59:59 of saturday night for week of selectedDate
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
                    const availabilitiesWithDates = new Map();
                    for (const [id, avail] of Object.entries(result)) {
                        availabilitiesWithDates.set(id, {
                            id: id,
                            endTime: moment.utc(avail.endTime).local().toDate(),
                            startTime: moment.utc(avail.startTime).local().toDate(),
                            subjects: avail.subjects,
                            tutor: avail.tutor,
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

    const getStatuses = useCallback(
        (availabilities) => {
            if (!user) {
                return;
            }

            availabilities.forEach(avail => {
                const url = `${availabilityLambdaUrl}/status/${avail.id}`;
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
                        const id = result.id.toString();
                        const status = result.status;

                        updateStatus(id, status);
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
            });
        },
        [user, updateStatus]
    );

    useEffect(() => {
        getAvailabilities(user);
    }, [
        user, getAvailabilities
    ]);

    useEffect(() => {
        getStatuses(availabilities);
    }, [
        availabilities, getStatuses
    ]);

    const onCancel = () => {
        history.push({
            pathname: "/calendar",
            state: {
                selectedDate: startTime
            }
        });
    };

    const postRequestStatus = (availId) => {
        // This is sort of a mistake, the id doesn't need to be appended to the url except I accidentaly made it like that in the cdk

        const tokenString = 'Bearer ' + user.signInUserSession.idToken.jwtToken;
        fetch(availabilityRequestLambdaUrl, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': tokenString
            },
            body: JSON.stringify({
                forAvailability: availId,
                fromUser: user.username
            })
        })
            .then(res => res.json())
            .then((result) => {
                getStatuses(availabilities);
            },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    setFailed(true);
                    var message = "1Error updating request status";
                    if (error.message) {
                        message += ": " + error.message;
                    }
                    setErrorMessage(message);
                })
            .catch(err => { // TODO this code is wet as fuck
                setFailed(true);
                var message = "2Error updating request status";
                if (err.message) {
                    message += ": " + err.message;
                }
                setErrorMessage(message);
            });
    };

    const updateRequestStatus = (availId, newStatus) => {
        // This is sort of a mistake, the id doesn't need to be appended to the url except I accidentaly made it like that in the cdk
        const url = availabilityRequestLambdaUrl + "/" + availId;

        const tokenString = 'Bearer ' + user.signInUserSession.idToken.jwtToken;
        fetch(url, {
            method: 'PUT',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': tokenString
            },
            body: JSON.stringify({
                forAvailability: availId,
                fromUser: user.username,
                status: newStatus
            })
        })
            .then(res => res.json())
            .then((result) => {
                getStatuses(availabilities);
            },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    setFailed(true);
                    var message = "1Error updating request status";
                    if (error.message) {
                        message += ": " + error.message;
                    }
                    setErrorMessage(message);
                })
            .catch(err => { // TODO this code is wet as fuck
                setFailed(true);
                var message = "2Error updating request status";
                if (err.message) {
                    message += ": " + err.message;
                }
                setErrorMessage(message);
            });
    };

    const onSendRequest = (event) => {
        const availId = event.target.getAttribute("data");

        postRequestStatus(availId);
    };

    const onCancelRequest = (event) => {
        const availId = event.target.getAttribute("data");
        const status = 'CANCELED';

        updateRequestStatus(availId, status);
    };

    const makeRequestAvailabilityButton = (availability) => {
        // possible avail statuses :
        // OPEN
        // REQEUSTED
        // CLOSED
        // ACCEPTED
        // DENIED

        // more TODO
        // does UI need to know if user has already sent a request that woudl conflict?
        // naw, backend babyy
        // and just say, can't make another request when you have an overlapping accepted request
        // this might need a state diagram tho

        let text;
        let onClickHandler;
        const status = statuses.get(availability.id);
        switch(status) {
            case "OPEN":
                text = "Request";
                onClickHandler = onSendRequest;
                break;
            case "REQUESTED":
            case "ACCEPTED":
                text = "Cancel";
                onClickHandler = onCancelRequest;
                break;
            case "DENIED":
                text = "Not Requestable";
                onClickHandler = () => {};
                break;
            default:
                // TODO
                // so this is kinda fucked
                // and is basically what I was ranting about when starting this whole piece of work
                // and the solution I have is to not show the avails until their statuses are calced
                // then just not showing the ones that are CLOSED (requested and accepted for another tutor
                text = "Not Requestable";
                onClickHandler = () => {};
                break;
        }

        return (
            <button onClick={onClickHandler} data={availability.id}>
                {text}
            </button>
        );
    };

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
                    Array.from(availabilities.entries()).map(availEntry => {
                        const status = statuses.get(availEntry[0]);
                        return (
                            <tr>
                                <td>
                                    {moment(availEntry[1].startTime).format("LT")}
                                </td>
                                <td>
                                    {moment(availEntry[1].endTime).format("LT")}
                                </td>
                                <td>
                                    {availEntry[1].tutor}
                                </td>
                                <td>
                                    {availEntry[1].subjects}
                                </td>
                                <td>
                                    {
                                            (status
                                        ?
                                            status
                                        :
                                            'loading')
                                    }
                                </td>
                                <td>
                                    {
                                        makeRequestAvailabilityButton(availEntry[1])
                                    }
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
