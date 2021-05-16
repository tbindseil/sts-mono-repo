import React, {useCallback, useEffect, useState} from 'react';
import MediaQuery from 'react-responsive';

import {useHistory} from 'react-router-dom';
import {cloneDeep} from 'lodash';

import './Profile.css';
import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';
import {FormTableRow} from '../forms/TextInput'
import {checkAuthenticated} from "../auth/CheckAuthenticated";

export function ProfileScreen() {
    return (
        <div className="TopLevelContainer">
            <Header/>

            <MediaQuery minWidth={765}>
                <ProfileBody
                    pageBorderClass={"PageBorder"}
                    underlineClass={"Underline"}/>
            </MediaQuery>

            <MediaQuery maxWidth={765}>
                <ProfileBody
                    pageBorderClass={"PageBorder2"}
                    underlineClass={"Underline2"}/>
            </MediaQuery>

            <Bottom/>
        </div>
    );
};

function ProfileBody(props) {
    const history = useHistory();

    // TODO dry access this from cfn exports somehow, and keep it dry, its in delete now
    const baseUrl = 'https://oercmchy3l.execute-api.us-west-2.amazonaws.com/prod/';

    const [editting, setEditting] = useState(false);

    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [user, setUser] = useState(undefined);
    useEffect(() => {
        checkAuthenticated(() => history.push("/anonymous-user"), setUser);
    }, [
        history, setUser
    ]);

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
                        email: "",
                        firstName: "",
                        lastName: "",
                        school: "",
                        grade: "",
                        bio: ""
                    });
                    setFailed(true);
                    setErrorMessage("Error getting profile");
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
                setProfile({
                    email: "",
                    firstName: "",
                    lastName: "",
                    school: "",
                    grade: "",
                    bio: ""
                });
                setFailed(true);
                setErrorMessage("Error saving profile");
            });

        setEditting(false);
    }

    const onCancel = () => {
        setEditting(false);
        getProfile();
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
            <header className={props.pageBorderClass}>

                <Title
                    titleText={"Profile"}
                    underlineClass={props.underlineClass}/>

                <div className="Centered MaxWidth">
                    <table className="ProfileTable">
                        <FormTableRow
                            onChange={handleChange}
                            name={"email"}
                            label={"Email:"}
                            value={profile.email}
                            readOnly={true}/>

                        <FormTableRow
                            onChange={handleChange}
                            name={"firstName"}
                            label={"First Name:"}
                            placeHolder={"<firstname>"}
                            value={profile.firstName}
                            readOnly={!editting}/>

                        <FormTableRow
                            onChange={handleChange}
                            name={"lastName"}
                            label={"Last Name:"}
                            placeHolder={"<lastname>"}
                            value={profile.lastName}
                            readOnly={!editting}/>

                        <FormTableRow
                            onChange={handleChange}
                            name={"school"}
                            label={"School:"}
                            placeHolder={"Where do you study?"}
                            value={profile.school}
                            readOnly={!editting}/>

                        <FormTableRow
                            onChange={handleChange}
                            name={"grade"}
                            label={"Grade:"}
                            placeHolder={"K-12? Junior in College? Young at Heart??"}
                            value={profile.grade}
                            readOnly={!editting}/>

                        <FormTableRow
                            onChange={handleChange}
                            name={"bio"}
                            label={"Bio:"}
                            placeHolder={"Tell us a little about where you are in your scholastic journey.."}
                            value={profile.bio}
                            readOnly={!editting}/>

                        { // TODO add list of class and class inquiries
                        }

                        { editting ?
                            <tr>
                                <td>
                                    <button onClick={onCancel}>
                                        Cancel
                                    </button>
                                </td>
                                <td>
                                    <button onClick={onFinish}>
                                        Update Profile
                                    </button>
                                </td>
                            </tr> :
                            <tr>
                                <td>
                                    <button onClick={editProfileOnClickHandler}>
                                        Edit
                                    </button>
                                </td>
                                <td>
                                </td>
                            </tr>
                        }

                    </table>

                    { failed &&
                        <p className="ErrorMessage">{errorMessage}</p>
                    }

                </div>

            </header>
        </>
    );
}
