import React, {useCallback, useEffect, useState} from 'react';
import MediaQuery from 'react-responsive';

import moment from 'moment';
import {useHistory} from 'react-router-dom';
import {cloneDeep} from 'lodash';

import './Profile.css';
import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';
import {FormTableRow} from '../forms/TextInput'
import {checkAuthenticated} from "../auth/CheckAuthenticated";
import {apiFactory} from '../fetch-enhancements/fetch-call-builders';
import {makeStandardErrorHandler} from "../fetch-enhancements/error-handling";

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

    const [editting, setEditting] = useState(false);

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

        const successHandler = (result) => {
            const newProfile = {
                email: result.email,
                username: result.cognitoId,
                firstName: result.firstName,
                lastName: result.lastName,
                school: result.school,
                grade: result.grade,
                age: result.age,
                bio: result.bio,
            };
            setProfile(newProfile);
        };

        const call = apiFactory.makeGetUser({
            username: user.username,
            successHandler: successHandler
        });
        call();
    }, [
        user
    ]);

    const getRequestsSent = useCallback(() => {
        if (!user) {
            return;
        }

        const successHandler = (result) => {
            setRequestsSent(result);
        };

        const call = apiFactory.makeGetAvailabilityRequests({forUser: "",
            forAvailability: 0,
            fromUser: user.username,
            user: user,
            successHandler: successHandler
        });
        call();
    }, [
        user
    ]);

    const getRequestsReceived = useCallback(() => {
        if (!user) {
            return;
        }

        const successHandler = (result) => {
            setRequestsReceived(result);
        };

        const call = apiFactory.makeGetAvailabilityRequests({forUser: user.username,
            forAvailability: 0,
            fromUser: "",
            user: user,
            successHandler: successHandler
        });
        call();
    }, [
        user
    ]);

    const [profile, setProfile] = useState({
        email: "",
        username: "",
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

    const onSave = () => {
        const call = apiFactory.makePutUser({
            user: user,
            successHandler: () => {},
            body: JSON.stringify(profile)
        });

        call();

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

    const updateRequest = (forAvailability, fromUser, newStatus) => {
        // TODO can still receive requests from self.
        const successHandler = (result) => {
            getRequestsSent();
            getRequestsReceived();
        };

        const call = apiFactory.makeUpdateRequestStatus({
            user: user,
            fromUser: fromUser,
            forAvailability: forAvailability,
            newStatus: newStatus,
            successHandler: successHandler
        });
        call();
    };

    const makeRequestSentActionButton = (forAvailability, status) => {
        const cancelRequest = (event) => {
            // TODO can they uncancel? Or jump back to the same time?
            updateRequest(forAvailability, user.username, 'CANCELED');
        };

        switch(status) {
            case "REQUESTED":
            case "ACCEPTED":
                return (
                    <button onClick={cancelRequest}>
                        Cancel
                    </button>
                );
            case "DENIED":
            case "CANCELLED":
            default:
                return (
                    <button>
                        No Action
                    </button>
                );
        }
    }

    const makeRequestReceivedActionButton = (forAvailability, fromUser, status) => {
        const acceptRequest = (event) => {
            updateRequest(forAvailability, fromUser, 'ACCEPTED');
        };
        const denyRequest = (event) => {
            updateRequest(forAvailability, fromUser, 'DENIED');
        };

        switch(status) {
            case "REQUESTED":
                return (
                    <table>
                        <tr>
                            <td>
                                <button onClick={acceptRequest}>
                                    Accept
                                </button>
                            </td>
                            <td>
                                <button onClick={denyRequest}>
                                    Deny
                                </button>
                            </td>
                        </tr>
                    </table>
                );
            case "ACCEPTED":
                return (
                    <button onClick={denyRequest}>
                        Deny
                    </button>
                );
            case "DENIED":
            case "CANCELLED":
            default:
                return (
                    <button>
                        No Action
                    </button>
                );
        }
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
                            name={"username"}
                            label={"Username:"}
                            value={profile.username}
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

                    <h2>
                        Requests Sent
                    </h2>
                    <table className="Centered ProfileRequestsTable">
                        <thead>
                            <tr>
                                <th>
                                    Start Time
                                </th>
                                <th>
                                    Subjects
                                </th>
                                <th>
                                    Tutor
                                </th>
                                <th>
                                    Status
                                </th>
                                <th>
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                Array.from(Object.entries(requestsSent)).map(requestEntry =>
                                    <tr>
                                        <td>
                                            {moment(requestEntry[1].startTime).format("LT")}
                                        </td>
                                        <td>
                                            {requestEntry[1].subject}
                                        </td>
                                        <td>
                                            {requestEntry[1].tutor}
                                        </td>
                                        <td>
                                            {requestEntry[1].status}
                                        </td>
                                        <td>
                                            {
                                                makeRequestSentActionButton(requestEntry[1].forAvailability, requestEntry[1].status)
                                            }
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>

                    <h2>
                        Requests Received
                    </h2>
                    <table className="Centered ProfileRequestsTable">
                        <thead>
                            <tr>
                                <th>
                                    Start Time
                                </th>
                                <th>
                                    Subjects
                                </th>
                                <th>
                                    Student
                                </th>
                                <th>
                                    Status
                                </th>
                                <th>
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                Array.from(Object.entries(requestsReceived)).map(requestEntry =>
                                    <tr>
                                        <td>
                                            {`${moment(requestEntry[1].startTime).format("L")} ${moment(requestEntry[1].startTime).format("LT")}`}
                                        </td>
                                        <td>
                                            {requestEntry[1].subject}
                                        </td>
                                        <td>
                                            {requestEntry[1].fromUser}
                                        </td>
                                        <td>
                                            {requestEntry[1].status}
                                        </td>
                                        <td>
                                            {
                                                makeRequestReceivedActionButton(requestEntry[1].forAvailability, requestEntry[1].fromUser, requestEntry[1].status)
                                            }
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>

                </div>

            </header>
        </>
    );
}
