import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';

import {Button, Form, Row} from 'antd';
import {Auth} from "aws-amplify";
import {CognitoIdentityProvider} from '@aws-sdk/client-cognito-identity-provider';

import {Header} from '../Header';
import {authStyles} from './styles';
import {checkAuthenticated} from "./CheckAuthenticated";

export function Delete() {
    const baseUrl = 'https://oercmchy3l.execute-api.us-west-2.amazonaws.com/prod/';

    const history = useHistory();

    const [user, setUser] = useState(undefined)
    useEffect(() => {
        checkAuthenticated(() => history.push("/anonymous-user"), setUser);
    }, [
        history, setUser
    ]);

    const [failed, setFailed] = useState(false);

    const onFinish = async (values) => {
        try {
            const cognitoIdentityProvider = new CognitoIdentityProvider({region: 'us-west-2'});

            var params = {
                AccessToken: user.signInUserSession.accessToken.jwtToken
            };
            cognitoIdentityProvider.deleteUser(params, function(err, data)  {
                if (err) {
                    setFailed(true);
                }

                const url = baseUrl + user.username;
                fetch(url, {
                    method: 'DELETE',
                    mode: 'cors',
                })
                    .then(history.push("/"))
                    .catch((err) => {
                        setFailed(true);
                    });

                Auth.signOut({ global: true });
                setUser(null);
            });
        } catch (err) {
            setFailed(true);
        }
    };

    const onFinishFailed = errorInfo => {
        setFailed(true);
    };

   return (
       <div>

           <Header/>

           <Row style={{display: 'flex', justifyContent: 'center', margin: "15px"}}>
               Delete Account
           </Row>

           { failed &&
               <p style={authStyles.errorMsg} >Error deleting account</p>
           }

           <Row>
               <Form
                   name="basic"
                   onFinish={onFinish}
                   onFinishFailed={onFinishFailed}
                   style={authStyles.form}>
                   <Form.Item>
                       <Button type="primary" htmlType="submit" style={authStyles.formButton}>
                           Delete Account
                       </Button>
                   </Form.Item>
                   { // TODO are you sure you want to delete account?
                   }
               </Form>
           </Row>
       </div>
   )

}
