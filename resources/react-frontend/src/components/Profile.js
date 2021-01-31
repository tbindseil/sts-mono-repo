import React from 'react';
import {Button, Form, Input, Row} from 'antd';
import {Link} from 'react-router-dom';

import {Header} from './Header';

export class Profile extends React.Component {

  /*const style = {
  };
  const styles = {
      loginForm: {
          "maxWidth": "300px"
      },
      loginFormForgot: {
          "float": "right"
      },
      loginFormButton: {
          "width": "100%"
      }
  };*/

  /*const onFinish = values => {
      console.log('onFinish Success:', values);
  };

  const onFinishFailed = errorInfo => {
      console.log('onFinishFailed Failed:', errorInfo);
  };*/

  render() {

    // get profile info from user lambda
    // note, should be authenticated
    const profile = {
      email: "profile.email",
      firstName: "profile.firstName",
      lastName: "profile.lastName",
      school: "profile.school",
      grade: "profile.grade",
      bio: "profile.bio"
    };

    /*const url = 'https://fep5kkldzj.execute-api.us-west-2.amazonaws.com/prod/';
    const profile
      fetch(url)
        .then(response => response.json())
        .then(data => console.log(data));*/



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
          {profile.email}
        </p>

        <h4>
          First Name:
        </h4>
        <p>
          {profile.firstName}
        </p>

        <h4>
          Last Name:
        </h4>
        <p>
          {profile.lastName}
        </p>

        <h4>
          School:
        </h4>
        <p>
          {profile.school}
        </p>

        <h4>
          Grade:
        </h4>
        <p>
          {profile.grade}
        </p>

        <h4>
          Bio:
        </h4>
        <p>
          {profile.bio}
        </p>

      {/*
      <Row style={{display: 'flex', justifyContent: 'center', margin: "15px"}}>
          Login
      </Row>
      <Row>
          <Form
              name="basic"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              style={styles.loginForm}>
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
                  {{getFieldDecorator('remember', {} THIS AND NEXT THREE WERE COMMENTED OUT
                  {    valuePropName: 'checked',}
                  {    initialValue: true,}
                  {})(<Checkbox>Remember me</Checkbox>)}}
                  <Link style={styles.loginFormForgot} to="forgotpassword1">
                      Forgot password
                  </Link>
                  <Button type="primary" htmlType="submit" style={styles.loginFormButton}>
                      Log in
                  </Button>
                  Don't have an account? <Link to="register">Register here</Link>
              </Form.Item>
          </Form>
      </Row>*/}
      </>

    );
  }
};
