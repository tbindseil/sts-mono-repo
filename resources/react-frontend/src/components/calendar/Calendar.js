import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';

import Calendar from 'react-calendar';
import {Auth} from "aws-amplify";

import {CreateAvailability} from './CreateAvailability';
import {CalendarDayContent} from './CalendarDayContent';

export function CalendarScreen() {
    const baseUrl = 'https://k2ajudwpt0.execute-api.us-west-2.amazonaws.com/prod'

    const history = useHistory();

    useEffect(() => {
        // TODO trigger this after close of CreateAvailability
        Auth.currentAuthenticatedUser({
            bypassCache: false  // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
        })
            .then(user => {
                console.log("1");
                setUser(user);
                console.log("2");
                getAvailabilities(user);
                console.log("3");
            })
            .catch(err => {
                history.push("/anonymous-user");
            });
    }, [

    ]);

    const aDate = new Date();

    const [user, setUser] = useState(undefined)
    const [value, setValue] = useState(new Date());
    const [currView, setCurrView] = useState("CALENDAR");
    const [availabilites, setAvailabilities] = useState([]);

    const onChange = (value) => {
        setValue(value);
        setCurrView("FORM")
    }

    const returnToCalendar = () => {
        setCurrView("CALENDAR");
    }

    // TODO get availabilities
    const getAvailabilities = (user) => {
        console.log("1.1");
        const url = baseUrl;
        console.log("user is:");
        console.log(user);
        const tokenString = 'Bearer ' + user.signInUserSession.idToken.jwtToken;
        fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': tokenString
                }
                })
            .then(res => res.json())
            .then(
                (result) => {
                    // hash availabilies by their dates
                    console.log("result is:");
                    console.log(result);

                    const availabilitiesWithDates = result.map(a => {
                        return {
                            endTime: new Date(a.endTime),
                            startTime: new Date(a.startTime),
                            subjects: a.subjects,
                            tutor: a.tutor
                        }
                    });

                    setAvailabilities(availabilitiesWithDates);
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    console.log("error fetching availibilities:");
                    console.log(error);
                }
            )
            .catch(err => {
                console.log("error fetching availabilities, err is:");
                console.log(err);
            });
    };

    return (
        <>
            <h2>
                Calendar
            </h2>
            {(currView === "CALENDAR") &&
                <Calendar
                    onChange={onChange}
                    tileContent= {
                        // TODO activeStartDate?
                        ({ date, view }) => {
                            // Take view and render a component using availabilities object
                            return <CalendarDayContent
                                date={date}
                                view={view}
                                availabilities={availabilites}/>
                        }
                    }
                    value={value}/>
            }

            {(currView === "FORM") &&
                <CreateAvailability
                    user={user}
                    returnToCalendar={returnToCalendar}
                    selectedDate={value}
                    aDate={aDate}/>
            }

        </>
    )
}
