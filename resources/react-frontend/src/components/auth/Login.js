import React, {useEffect, useState} from 'react';
import {Link, useHistory} from 'react-router-dom';

import {Button, Form, Input} from 'antd';
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {Auth} from "aws-amplify";

import {Header} from '../Header';
import {authStyles} from './styles';
import {checkAuthenticated} from "./CheckAuthenticated";

export function Login() {
    const history = useHistory();

    useEffect(() => {
        checkAuthenticated(false, () => history.push("/profile"));
    });

    const [failed, setFailed] = useState(false);

    const onFinish = values => {
        Auth.signIn(values.email, values.password)
            .then(user => {
                history.push("/profile");
            })
            .catch(err => {
                setFailed(true);
            });
    };

    const onFinishFailed = errorInfo => {
        setFailed(true);
    };

   return (
       <>
           <Header/>

           <h1>Login</h1>

           { failed &&
               <p style={authStyles.errorMsg} >Error Logging In</p>
           }

           <Form
               name="basic"
               onFinish={onFinish}
               onFinishFailed={onFinishFailed}
               style={authStyles.form}>
               <Form.Item
                   name="email"
                   rules={[
                       {
                           required: true,
                           message: 'Please input your email!',
                       }
                   ]}>
                   <Input
                       prefix={<UserOutlined/>}
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
                   prefix={<LockOutlined/>}
                   type="password"
                   placeholder="Password"
               />

               </Form.Item>
               <Form.Item>
                   {/* TODO forgot password
                   <Link style={authStyles.formForgot} to="forgotpassword1">
                       Forgot password
                   </Link>
                   */}
                   <Button type="primary" htmlType="submit" style={authStyles.formButton}>
                       Log in
                   </Button>
                   Don't have an account? <Link to="register">Register here</Link>
               </Form.Item>
           </Form>
       </>

   );
}
