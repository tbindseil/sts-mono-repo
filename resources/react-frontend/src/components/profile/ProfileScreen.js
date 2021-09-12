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
    const availabilityRequestsBaseUrl = 'https://04c0w1j888.execute-api.us-west-2.amazonaws.com/prod/';

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
                        age: result.age,
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
                        age: "",
                        bio: ""
                    });
                    setFailed(true);
                    setErrorMessage("Error getting profile");
                }
            );
    }, [
        user
    ]);

    const getRequestsSent = useCallback(() => {
        if (!user) {
            return;
        }

        // get avail requests sent
        const availRequestSentUrl = new URL(availabilityRequestsBaseUrl);
        const getAvailRequestsInput = {
            forUser: "",
            forAvailability: 0,
            fromUser: user.username
        };
        availRequestSentUrl.searchParams.append('getAvailRequestInput', JSON.stringify(getAvailRequestsInput));
        const tokenString = 'Bearer ' + user.signInUserSession.idToken.jwtToken;
        fetch(availRequestSentUrl, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': tokenString
                },
            })
            .then(res => res.json())
            .then(
                (result) => {
                    console.log("requests sent result is:");
                    console.log(result);
                    setRequestsSent(result);
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    setFailed(true);
                    setErrorMessage("Error getting requests sent");
                }
            );
    }, [
        user
    ]);

    const getRequestsReceived = useCallback(() => {
        if (!user) {
            return;
        }

        // get avail requests recieved
        const availRequestReceivedUrl = new URL(availabilityRequestsBaseUrl);
        const getAvailRequestsReceivedInput = {
            forUser: user.username,
            forAvailability: 0,
            fromUser: ""
        };
        availRequestReceivedUrl.searchParams.append('getAvailRequestInput', JSON.stringify(getAvailRequestsReceivedInput));
        const tokenString = 'Bearer ' + user.signInUserSession.idToken.jwtToken;
        fetch(availRequestReceivedUrl, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': tokenString
                },
            })
            .then(res => res.json())
            .then(
                (result) => {
                    console.log("requests received result is:");
                    console.log(result);
                    setRequestsReceived(result);
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    setFailed(true);
                    setErrorMessage("Error getting requests received");
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
        age: "",
        bio: ""
    });
    useEffect(() => {
        getProfile();
    }, [
        user, getProfile
    ]);

    const [requestsSent, setRequestsSent] = useState({});
    useEffect(() => {
        getRequestsSent();
    }, [
        user, getRequestsSent
    ]);

    const [requestsReceived, setRequestsReceived] = useState({});
    useEffect(() => {
        getRequestsReceived();
    }, [
        user, getRequestsReceived
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
                    age: "",
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

                { // TODO somehow got weird dates when 1s were put in for registration
                }

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
                            name={"age"}
                            label={"Age:"}
                            placeHolder={"K-12? Junior in College? Young at Heart??"}
                            value={profile.age}
                            readOnly={!editting}/>

                        <FormTableRow
                            onChange={handleChange}
                            name={"bio"}
                            label={"Bio:"}
                            placeHolder={"Tell us a little about where you are in your scholastic journey.."}
                            value={profile.bio}
                            readOnly={!editting}/>

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

                {
                    // so maybe it is better to jump to a ViewRequestScreen,
                    // this screen would know whether to let the user cancel from the same screen
                    // as they could..., well basically this is just another positive result of being able
                    // to navigate to the same page from here as from the requestss page, less code duplication
                    // blah blah blah
                }

                    <table>
                        <thead>
                            <tr>
                                <th>
                                    Requests Sent
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                Array.from(Object.entries(requestsSent)).map(requestEntry =>
                                    <tr>
                                        <td>
                                            {requestEntry[1].subject}
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>

                {
                    // since each is its own table, have a row for subjects, starttime, tutor/requestor, and button
                }

                    <table>
                        <thead>
                            <tr>
                                <th>
                                    Requests Received
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                Array.from(Object.entries(requestsReceived)).map(requestEntry =>
                                    <tr>
                                        <td>
                                            {requestEntry[1].subject}
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>



        {

            // TODO tutor and requestor in description?????

                            // <tr>
                                // <td>
            // what info do i want to display anyways?
            // date, time, subject, status
            // already have status
            //
            // so i have a fork in the road
            // 1) take forAvail and request deets about the avail
            //      notes:
            //          more restful
            //          already started the beginning, but I would need an api to get single avail by id
            // 2) enhance existing or make new api in order to return avail deets
            //      notes:
            //          get all data at once (a little faster?)
            //          i don't have to make reusable code
            // I decided to enhance existing
            //
            // now, how do i show two lists with potentially different lengths?
            // 1) take max of both lenghts, and iterate that many times (this is for basic table)
            // 2) two vertical flexboxes
            //      one flexbox for received, and one for sent
            //      they grow indefinitely, and each card takes the space needed
            // 3) two vertical lists, not flexboxes - check
                                    // Request Sent
                                // </td>
                                // <td>
                                    // Request Received
                                // </td>
                            // </tr>
        }

                    { failed &&
                        <p className="ErrorMessage">{errorMessage}</p>
                    }

                </div>

            </header>
        </>
    );
}
