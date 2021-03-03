import React, {useEffect, useState} from 'react';

import {Row} from 'antd';
import {useHistory} from 'react-router-dom';

import {Header} from '../Header';
import {checkAuthenticated} from "../auth/CheckAuthenticated";
import {ViewProfile, ProfilePiece} from "./ViewProfile";
import {EditProfile} from "./EditProfile";

export function ProfileScreen() {

    const history = useHistory();

    // TODO dry access this from cfn exports somehow, and keep it dry, its in delete now
    const baseUrl = 'https://oercmchy3l.execute-api.us-west-2.amazonaws.com/prod/';

    const [editting, setEditting] = useState(false);

    const [user, setUser] = useState(undefined);
    useEffect(() => {
        checkAuthenticated(() => history.push("/anonymous-user"), setUser);
    }, [
        history, setUser
    ]);

    const [profile, setProfile] = useState("");
    useEffect(() => {
        if (!user) {
            return;
        }

        const url = baseUrl + user.username;
        fetch(url)
            .then(res => res.json())
            .then(
                (result) => {
                    const profile = {
                        email: result.email,
                        firstName: result.firstName,
                        lastName: result.lastName,
                        school: result.school,
                        grade: result.grade,
                        bio: result.bio,
                    };
                    setProfile(profile);
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    setProfile({
                        // TODO so bad..
                        email: "error",
                        firstName: "error",
                        lastName: "error",
                        school: "error",
                        grade: "error",
                        bio: "error"
                    });
                }
            );
    }, [
        user
    ]);

    const modifyOnClickHandler = () => {
        setEditting(true);
    }

    const onSave = (profile) => {
        async function putProfile(url = '', token = '', profile = {}) {
            const tokenString = 'Bearer ' + token;
            const response = await fetch(url, {
                method: 'PUT',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': tokenString
                },
                body: JSON.stringify(profile)
            });
            return response;
        }


        const url = baseUrl + user.username;

        putProfile(url, user.signInUserSession.idToken.jwtToken, profile)
            .then(data => {
                setProfile(profile);
            })
            .catch(error => {
                // TODO
                console.log("@@@ @@@ error @@@ @@@")
                console.log(error);
            });

        setEditting(false);
    }

    const onCancel = () => {
        setEditting(false);
    }

    const onClickMyCalendar = () => {
        history.push({
            pathname: "/my-calendar",
            state: {
                selectedDate: new Date()
            }
        });
    }

    return (

        <>
            <Header/>

            <Row>
                <h2>
                    View Profile Info
                </h2>

                <ProfilePiece
                    header="Email:"
                    content={profile.email}
                />

                {editting ?
                    <EditProfile
                        currProfile={profile}
                        onSave={onSave}
                        onCancel={onCancel}
                    /> :
                    <ViewProfile
                        profile={profile}
                        modifyOnClickHandler={modifyOnClickHandler}
                    />}

            </Row>
            <Row>
                <button onClick={onClickMyCalendar}>
                    <a href="/my-calendar">My Calendar</a>
                </button>
            </Row>
            <Row>
                <button>
                    <a href="/logout">Logout</a>
                </button>
            </Row>
            <Row>
                <button>
                    <a href="/change-password">Change Password</a>
                </button>
            </Row>
            <Row>
                <button>
                    <a href="/delete-account">Delete Account</a>
                </button>
            </Row>
        </>

    );
};
