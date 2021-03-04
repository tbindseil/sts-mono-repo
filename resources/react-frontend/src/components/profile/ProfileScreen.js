import React, {useCallback, useEffect, useState} from 'react';

import {Row} from 'antd';
import {useHistory} from 'react-router-dom';
import {cloneDeep} from 'lodash';

import {Header} from '../Header';
import {FormButton} from '../forms/FormButton'
import {TextInput} from '../forms/TextInput'
import {checkAuthenticated} from "../auth/CheckAuthenticated";

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

    // TODO use callback
    const getProfile = useCallback(() => {
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

    const [profile, setProfile] = useState({
        email: "",
        firstName: "",
        lastName: "",
        school: "",
        grade: "",
        bio: ""
    });
    useEffect(() => {
        getProfile();
    }, [
        user, getProfile
    ]);

    const editProfileOnClickHandler = () => {
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
        getProfile();
    }

    const onClickMyCalendar = () => {
        history.push({
            pathname: "/my-calendar",
            state: {
                selectedDate: new Date()
            }
        });
    }

    const onFinish = () => {
        onSave(profile);
    }

    const handleChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        var updatedProfile = cloneDeep(profile);
        updatedProfile[name] = value;

        setProfile(updatedProfile);
    }

    return (

        <>
            <Header/>

            <h2>
                Profile
            </h2>

            <form
                onChange={handleChange}>

                <TextInput
                    name={"email"}
                    label={"Email:"}
                    value={profile.email}
                    readOnly={true}/>
                <br/>
                <br/>

                <TextInput
                    name={"firstName"}
                    label={"First Name:"}
                    value={profile.firstName}
                    readOnly={!editting}/>
                <br/>
                <br/>

                <TextInput
                    name={"lastName"}
                    label={"Last Name:"}
                    value={profile.lastName}
                    readOnly={!editting}/>
                <br/>
                <br/>

                <TextInput
                    name={"school"}
                    label={"School:"}
                    value={profile.school}
                    readOnly={!editting}/>
                <br/>
                <br/>

                <TextInput
                    name={"grade"}
                    label={"Grade:"}
                    value={profile.grade}
                    readOnly={!editting}/>
                <br/>
                <br/>

                <TextInput
                    name={"bio"}
                    label={"Bio:"}
                    value={profile.bio}
                    readOnly={!editting}/>
                <br/>
                <br/>

                { editting ?
                    <>

                        <FormButton
                            onClick={onFinish}
                            value={"Update Profile"}/>
                        <FormButton
                            onClick={onCancel}
                            value={"Cancel"}/>
                    </> :
                    <>
                        <FormButton
                            onClick={editProfileOnClickHandler}
                            value={"Edit Profile"}/>
                    </> }
            </form>

            <br/>
            <br/>

            { // TODO could probably be part of profile drop down
            }
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
