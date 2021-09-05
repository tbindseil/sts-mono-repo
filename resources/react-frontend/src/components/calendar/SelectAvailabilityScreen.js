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

// Note, this has to be outside the below react component function
// because it is a dependency in some of the other callback.
// This means, that every render would make a new 'updateStatus' object
// and that would trigger a perpetual rerender situation.
// The typical mitigation for this situation is to wrap the function in a
// 'useCallback' hook, but that isn't possible here without my mysterious
// IDE settings yelling at me to include statuses and setStatuses as dependencies.
// This also triggers a perpetual rerender situation, and pushing those
// dependencies down further (ie calling update status with those as args)
// makes the callee have to depend on them, which also causes a perpetual
// rerender situation. Ultimately, I like my mysterious compiler thing and
// opted to satisfy it by moving this outside the component function instead
// of removing the dependency thing and getting the warning.
const updateStatus = (id, status, statuses, setStatuses) => {
    statuses.set(id, status);
    const newStatuses = new Map(statuses);
    setStatuses(newStatuses);
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

    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [loading, setLoading] = useState(false);

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
                        availabilitiesWithDates.set(id.toString(), {
                            id: id.toString(),
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
        (availabilities, currentStatuses) => {
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
                        const id = result.id;
                        const status = result.status;

                        updateStatus(id, status, statuses, setStatuses);
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
        [user]
    );

    useEffect(() => {
        getAvailabilities(user);
    }, [
        user, getAvailabilities
    ]);

    useEffect(() => {
        getStatuses(availabilities, statuses);
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

    const onSendRequest = (event) => {
        // get avail id
        const availId = event.target.getAttribute("data");
        const status = 'REQUESTED';

        // TODO how to deal with loading for button here?

        // send request
        const tokenString = 'Bearer ' + user.signInUserSession.idToken.jwtToken;
        fetch(availabilityRequestLambdaUrl, {
            method: 'PUT',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': tokenString
            },
            body: JSON.stringify({
                id: availId,
                status: status
            })
        })
            .then(res => res.json())
            .then((result) => {
                console.log("sendRequest result is:");
                console.log(result);
                // there should only be one..
                for (const [id, avail] of Object.entries(result)) {
                    updateStatus(id, avail.status, statuses, setStatuses);
                }
            },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    setFailed(true);
                    var message = "1Error sending request";
                    if (error.message) {
                        message += ": " + error.message;
                    }
                    setErrorMessage(message);
                })
            .catch(err => { // TODO this code is wet as fuck
                setFailed(true);
                var message = "2Error sending request";
                if (err.message) {
                    message += ": " + err.message;
                }
                setErrorMessage(message);
            });
    };

    const onCancelRequest = (event) => {

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
        switch(availability.status) {
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
            <button onClick={onClickHandler} availabilityId={availability.id}>
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
