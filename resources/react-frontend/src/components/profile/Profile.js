import React from 'react';
import {Button, Form, Input, Row} from 'antd';

import {Auth} from "aws-amplify";

import {Header} from '../Header';

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
  styles = {
      loginForm: {
          "maxWidth": "300px"
      },
      loginFormForgot: {
          "float": "right"
      },
      loginFormButton: {
          "width": "100%"
      }
  };

  onFinish = values => {
      console.log('onFinish Success:', values);
  };

  onFinishFailed = errorInfo => {
      console.log('onFinishFailed Failed:', errorInfo);
  };


  constructor(props) {
    super(props)
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
      editting: false,
    });
  }

  render() {

    return (

      <>
        <Header/>

        <button onClick={this.modifyOnClickHandler}>
          Modify
        </button>

        <h2>
          View Profile Info
        </h2>

        <h4>
          Email:
        </h4>
        <p>
          {this.state.profile.email}
        </p>

        <h4>
          First Name:
        </h4>
        <p>
          {this.state.profile.firstName}
        </p>

        <h4>
          Last Name:
        </h4>
        <p>
          {this.state.profile.lastName}
        </p>

        <h4>
          School:
        </h4>
        <p>
          {this.state.profile.school}
        </p>

        <h4>
          Grade:
        </h4>
        <p>
          {this.state.profile.grade}
        </p>

        <h4>
          Bio:
        </h4>
        <p>
          {this.state.profile.bio}
        </p>

        <Row style={{display: 'flex', justifyContent: 'center', margin: "15px"}}>
            Login
        </Row>
        <Row>
            <Form
                name="basic"
                onFinish={this.onFinish}
                onFinishFailed={this.onFinishFailed}
                style={this.styles.loginForm}>
                <Form.Item
                    name="username"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your email!',
                        }
                    ]}>
                    <Input
                        placeholder="Email"
                    />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your Password!'
                        }
                    ]}>

                    <Input
                        type="password"
                        placeholder="Password"
                    />

                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" style={this.styles.loginFormButton}>
                        Update
                    </Button>
                    <Button type="primary" htmlType="submit" style={this.styles.loginFormButton}>
                        Cancel
                    </Button>
                </Form.Item>
            </Form>
        </Row>
      </>

    );
  }
};
