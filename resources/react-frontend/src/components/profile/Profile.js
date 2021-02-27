import React from 'react';

import {Row} from 'antd';
import {Auth} from "aws-amplify";

import {Header} from '../Header';
import {ViewProfile, ProfilePiece} from "./ViewProfile";
import {EditProfile} from "./EditProfile";

export class Profile extends React.Component {
    cognitoId;
    token;
    // TODO dry access this from cfn exports somehow, and keep it dry, its in delete now
    baseUrl = 'https://oercmchy3l.execute-api.us-west-2.amazonaws.com/prod/';

    // so bad..
    errorProfile = {
        email: "error",
        firstName: "error",
        lastName: "error",
        school: "error",
        grade: "error",
        bio: "error"
    };

    constructor(props) {
        super(props);
        this.getProfile = this.getProfile.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.state = {
            editting: false,
            profile: {
                email: "",
                firstName: "",
                lastName: "",
                school: "",
                grade: "",
                bio: ""
            }
        }
    }

    getProfile = () => {
        const url = this.baseUrl + this.cognitoId;
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
                    this.setState({
                        profile: profile
                    });
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    this.setState({
                        profile: this.errorProfile
                    });
                }
            );
    }

    componentDidMount() {
        Auth.currentAuthenticatedUser({
            bypassCache: false  // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
        })
            .then(user => {
                this.cognitoId = user.username;
                this.token = user.signInUserSession.idToken.jwtToken;
                this.getProfile();
            })
            .catch(err => {
                this.props.history.push("/anonymous-user");
            });
    }

    modifyOnClickHandler = () => {
        this.setState({
            editting: true,
        });
    }

    onSave = (profile) => {
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


        const url = this.baseUrl + this.cognitoId;

        putProfile(url, this.token, profile)
            .then(data => {
                this.setState({
                    profile: profile
                });
            })
            .catch(error => {
                console.log("@@@ @@@ error @@@ @@@")
                console.log(error);
            });

        this.setState({
            editting: false,
        });
    }

    onCancel = () => {
        this.setState({
            editting: false,
        });
    }

    render() {
        return (

            <>
                <Header/>

                <Row>
                    <h2>
                        View Profile Info
                    </h2>

                    <ProfilePiece
                        header="Email:"
                        content={this.state.profile.email}
                    />

                    {this.state.editting ?
                        <EditProfile
                            currProfile={this.state.profile}
                            onSave={this.onSave}
                            onCancel={this.onCancel}
                        /> :
                        <ViewProfile
                            profile={this.state.profile}
                            modifyOnClickHandler={this.modifyOnClickHandler}
                        />}

                </Row>
                <Row>
                    <button>
                        <a href="calendar">Calendar</a>
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
    }
};
