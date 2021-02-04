import React from 'react';
import {Button, Form, Input, Row} from 'antd';

import {Auth} from "aws-amplify";

import {Header} from '../Header';
import {ViewProfile} from "./ViewProfile";
import {EditProfile} from "./EditProfile";

export class Profile extends React.Component {
  email;
  token;
  base_url = 'https://7uprzm3fo6.execute-api.us-west-2.amazonaws.com/prod/';

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
    super(props)
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

  getProfile = (email) => {
    const url = this.base_url + email;
    fetch(url)
      .then(res => res.json())
      .then(
        (result) => {
          console.log("result is:")
          console.log(result)
          const profile = {
            email: result.email,
            // TODO deal with snake_case vs camelCase
            firstName: result.first_name,
            lastName: result.last_name,
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
          const profile = this.errorProfile
          this.setState({
              profile: profile
          });
        }
      );
  }

  componentDidMount() {
    Auth.currentAuthenticatedUser({
      bypassCache: false  // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
    })
      .then(user => {
        this.email = user.attributes.email;
        this.token = user.signInUserSession.idToken.jwtToken;
        console.log(" @@@ token is: @@@");
        console.log(this.token);
        this.getProfile(this.email);
      })
      .catch(err => {
        console.log(err);
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
    async function getData(url = '', token = '') {
        // Default options are marked with *
        const tokenString = 'Bearer ' + token;
        console.log("tokenString is:");
        console.log(tokenString);
        const response = await fetch(url, {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin, Access-Control-Allow-Headers',
              'Access-Control-Allow-Credentials': true,
              'Authorization': tokenString
            }
        });
        return response; // parses JSON response into native JavaScript objects
    }

    const url = this.base_url + this.email;
    getData(url, this.token)
      .then(data => {
        console.log("@@@ @@@ success @@@ @@@")
        console.log(data); // JSON data parsed by `data.json()` call
      })
      .catch(error => {
        console.log("@@@ @@@ error @@@ @@@")
        console.log(error);
      });



    // ensure expected result is returned

    // set editting to false
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
                profile = {this.state.profile}
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
