import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';

import Calendar from 'react-calendar';
import moment from 'moment';

import {Header} from '../Header';
import {checkAuthenticated} from "../auth/CheckAuthenticated";
import {CalendarDayContent} from './CalendarDayContent';

export function CalendarScreen() {
    const baseUrl = 'https://k2ajudwpt0.execute-api.us-west-2.amazonaws.com/prod'

    const history = useHistory();

    const [user, setUser] = useState(undefined)
    useEffect(() => {
        checkAuthenticated(() => history.push("/anonymous-user"), setUser);
    }, [
        history, setUser
    ]);

    useEffect(() => {
        getAvailabilities(user);
    }, [
        user
    ]);

    useEffect(() => {
        checkAuthenticated(() => history.push("/anonymous-user"), setUser);
    }, [
        history, setUser
    ]);

    const [availabilites, setAvailabilities] = useState([]);

    const onChange = (value) => {
        history.push({
            pathname: "/create-availability",
            state: {
                selectedDate: value
            }
        });
    }

    const getAvailabilities = (user) => {
        if (!user) {
            return;
        }

        const url = baseUrl;
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
                    console.log(moment());
                    const availabilitiesWithDates = result.map(a => {
                        return {
                            endTime: moment.utc(a.endTime).local(),
                            startTime: moment.utc(a.startTime).local(),
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
                }
            )
            .catch(err => {
                // TODO
                console.log("error fetching availabilities, err is:");
                console.log(err);
            });
    };

    return (
        <>
            <Header/>

            <h2>
                Calendar
            </h2>

            <Calendar
                onChange={onChange}
                tileContent= {
                    ({ date, view }) => {
                        return (
                            <CalendarDayContent
                                date={date}
                                view={view}
                                availabilities={availabilites}/>
                        )
                    }
                }/>
        </>
    )
}
