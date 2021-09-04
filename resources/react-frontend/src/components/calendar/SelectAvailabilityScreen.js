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

                    // now i think i want to kick off one fetch per avail
                    // at the end of each fetch, call setAvailabilities to trigger render
                    /* availabilitiesWithDates.forEach(avail => {
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
                                // console.log("result is:");
                                // console.log(result);
                                const id = result.id;
                                const status = result.status;


                                // console.log("status is:");
                                // console.log(status);
                                // console.log("availabilities is:");
                                // console.log(availabilities);
                                availabilities.get(id)['status'] = status;
                                setAvailabilities(availabilitiesWithDates);

                                // uhhh - gonna use two maps
                                // options
                                // 1) set a trick var to trigger a refresh
                                // 2) somehow reset the availabilities var without triggering this
                                //      which basically means put this inside that, for each, trigger a fetch call
                                //          but this doesn't take into account individual loadability of the statuses
                            },
                                // Note: it's important to handle errors here
                                // instead of a catch() block so that we don't swallow
                                // exceptions from actual bugs in components.
                                (error) => {
                                    setFailed(true);
                                    var message = "1Error getting availability status";
                                    if (error.message) {
                                        message += ": " + error.message;
                                    }
                                    setErrorMessage(message);
                                })
                            .catch(err => { // TODO this code is wet as fuck
                                setFailed(true);
                                var message = "2Error getting availability status";
                                // console.log("HEREREREREER");
                                if (err.message) {
                                    message += ": " + err.message;
                                }
                                setErrorMessage(message);
                            });

                    });*/
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

            const fetchedStatuses = new Map();
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
                        console.log("result is:");
                        console.log(result);
                        const id = result.id;
                        const status = result.status;

                        // availabilities.get(id)['status'] = status;
                        fetchedStatuses.set(id, status);

                        console.log("fetchedStatuses is:");
                        console.log(fetchedStatuses);

                        // so, I am suspicious that the same pointer val will not trigger a render
                        // in order to suss that out, i will deep copy the map and then setStatuses with the deep copy
                        // dont worry, javascript is thread safe by default: https://www.mountainproject.com/route/105757333/south-prow
                        const newFetchedStatuses = new Map(fetchedStatuses);
                        // so it worked! nice!
                        // now there are two things to go back through and fix immediately
                        // 1) somehow statuses are fetched like a dozen times
                        //      a) how many times?
                        // 2) why tf do i have to make a new map?
                        //      a) could just use an object
                        //      b) could just do this too! https://azimi.io/es6-map-with-react-usestate-9175cd7b409b
                        //      gonna do b

                        setStatuses(newFetchedStatuses); // TODO do i need both?
                        // uhhh - gonna use two maps
                        // options
                        // 1) set a trick var to trigger a refresh
                        // 2) somehow reset the availabilities var without triggering this
                        //      which basically means put this inside that, for each, trigger a fetch call
                        //          but this doesn't take into account individual loadability of the statuses
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
            setStatuses(fetchedStatuses);
        },
        [user]
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
                                        console.log("rendeirng... and statuses and availEntry are:") ||
                                        console.log(statuses) ||
                                        console.log(availEntry) ||
                                        console.log("statuses[\"132\"] is:") ||
                                        console.log(statuses.get("132")) || 
                                        // the above definitely printed OPEN with what i would think would be the same code
                                        console.log("statuses[132] is:") ||
                                        console.log(statuses.get(132)) || 
                                        console.log("before") ||
                                        console.log((statuses.get(availEntry[0])
                                        ?
                                            statuses.get(availEntry[0])
                                        :
                                            'loading')) ||
                                        console.log("after") || 
                                        // this is kinda fucked up
                                        // there is weird and hard to guarantee conditions between statuses set and availabilities map
                                        // need to figure how to manually trigger a refresh or do it better
                                            (statuses.get(availEntry[0])
                                        ?
                                            statuses.get(availEntry[0])
                                        :
                                            'loading')
                                    }
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
