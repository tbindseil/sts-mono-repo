import React from 'react';

import {Auth} from "aws-amplify";

import {Header} from '../Header';
import {ViewProfile} from "./ViewProfile";
import {EditProfile} from "./EditProfile";

export class Profile extends React.Component {
  cognitoId;
  token;
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

  style = {
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

  getProfile = (cognitoId) => {
    // TODO pass in cognito id or use class var?
    const url = this.baseUrl + cognitoId;
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
        console.log("setting cognitoId to: ");
        console.log(this.cognitoId);
        this.token = user.signInUserSession.idToken.jwtToken;
        this.getProfile(this.cognitoId);
      })
      .catch(err => {
        this.setState(this.errorProfile);
      });
  }

  modifyOnClickHandler = () => {
    this.setState({
      editting: true,
    });
  }

  onSave = (profile) => {
    // set state based off profile input

    // put request to change profile
    // TODO change name
    async function postProfile(url = '', token = '', profile = {}) {
        // Default options are marked with *
        const tokenString = 'Bearer ' + token;
        const response = await fetch(url, {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin, Access-Control-Allow-Headers',
              'Access-Control-Allow-Credentials': true,
              'Content-Type': 'application/json',
              'Authorization': tokenString
            },
            body: JSON.stringify(profile)
        });
        return response; // parses JSON response into native JavaScript objects
    }


    const url = this.baseUrl + this.cognitoId;

    postProfile(url, this.token, profile)
      .then(data => {
        // I don't think anything needs to run here..
        // it seems to pick up changes automatically
        // but still updates when it fails... TODO
        console.log("@@@ @@@ success @@@ @@@")
        console.log(data); // JSON data parsed by `data.json()` call
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

        <h2>
          View Profile Info
        </h2>

        <h4>
          Email:
        </h4>
        <p>
          {this.state.profile.email}
        </p>

        {this.state.editting ?
            <EditProfile
                currProfile = {this.state.profile}
                onSave = {this.onSave}
                onCancel = {this.onCancel}
            /> :
            <ViewProfile
                profile={this.state.profile}
                modifyOnClickHandler={this.modifyOnClickHandler}
            />}

      </>

    );
  }
};
