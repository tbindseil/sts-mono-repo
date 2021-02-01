import React from 'react';
import {Button, Form, Input, Row} from 'antd';

import {Auth} from "aws-amplify";

import {Header} from '../Header';
import {ViewProfile} from "./ViewProfile";
import {EditProfile} from "./EditProfile";

export class Profile extends React.Component {

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
    const url = 'https://wv9um2deug.execute-api.us-west-2.amazonaws.com/prod/' + email;
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
      .then(user => this.getProfile(user.attributes.email))
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

  onSave = () => {
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
