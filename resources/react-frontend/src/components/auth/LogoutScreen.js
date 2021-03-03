import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';

import {Button, Form, Row} from 'antd';
import {Auth} from "aws-amplify";

import {Header} from '../Header';
import {authStyles} from './styles';
import {checkAuthenticated} from "./CheckAuthenticated";

export function LogoutScreen() {
    const history = useHistory();

    useEffect(() => {
        checkAuthenticated(() => history.push("/anonymous-user"), () => {});
    }, [
        history
    ]);

    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const onFinish = values => {
        Auth.signOut({ global: true })
            .then(() => {
                history.push("/");
            })
            .catch(err => {
                setFailed(true);
                var message = "Error Logging Out";
                if (err.message) {
                    message += ": " + err.message;
                }
                setErrorMessage(message);
            });
    };

    const onFinishFailed = errorInfo => {
        setFailed(true);
    };

   return (
       <div>

           <Header/>

           <Row style={{display: 'flex', justifyContent: 'center', margin: "15px"}}>
               Logout
           </Row>

           { failed &&
               <p style={authStyles.errorMsg} >{errorMessage}</p>
           }

           <Row>
               <Form
                   name="basic"
                   onFinish={onFinish}
                   onFinishFailed={onFinishFailed}
                   style={authStyles.form}>
                   <Form.Item>
                       <Button type="primary" htmlType="submit" style={authStyles.formButton}>
                           Log out
                       </Button>
                   </Form.Item>
               </Form>
           </Row>
       </div>
   );

}
