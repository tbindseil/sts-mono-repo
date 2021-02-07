import './App.css';
import {Switch, Route} from 'react-router-dom';

import Amplify from '@aws-amplify/core'
import awsConfig from "./configs/aws-configs";

import {AboutUs} from './components/AboutUs';
import {GetInvolved} from './components/GetInvolved';
import {RequestTutor} from './components/RequestTutor';
import {Contacts} from './components/Contacts';
import {Home} from './components/Home';

import {AuthScreen} from './components/auth/auth-screen';
import {RegisterForm} from "./components/auth/register-form";
import {ForgotPasswordEmailForm} from "./components/auth/forgot-password-email-form";
import {ForgotPasswordEmailCodeForm} from "./components/auth/forgot-password-email-code-form";
import {RegisterConfirmForm} from "./components/auth/register-confirm-form";
import {LoginForm} from "./components/auth/login-form";
import {LogoutForm} from "./components/auth/logout-form";

import {Profile} from "./components/profile/Profile";


Amplify.configure(awsConfig);

const App = () => {
  // TODO compose Switch somehow?
  return (
    <div className="App">
      <Switch>
        <Route exact path="/" component={Home}/>
        <Route path="/home" component={Home}/>
		<Route path="/home" component={Home}/>
        <Route path="/about-us" component={AboutUs}/>
        <Route path="/get-involved" component={GetInvolved}/>
        <Route path="/request-a-tutor" component={RequestTutor}/>
        <Route path="/contacts" component={Contacts}/>
        <Route path="/auth" component={AuthScreen}/>

        <Route path={"/login"} component={LoginForm}/>
        <Route path={"/register"} component={RegisterForm}/>
        <Route path={"/registerconfirm"} component={RegisterConfirmForm}/>
        <Route path={"/forgotpassword1"} component={ForgotPasswordEmailForm}/>
        <Route path={"/forgotpassword2"} component={ForgotPasswordEmailCodeForm}/>
        <Route path={"/forgotpassword2/:email"} component={ForgotPasswordEmailCodeForm}/>
        <Route path={"/logout"} component={LogoutForm}/>

        <Route path={"/profile"} component={Profile}/>

      </Switch>
    </div>
  );
}

export default App;
