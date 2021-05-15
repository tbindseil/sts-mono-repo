import React from 'react';
import './App.css';
import {Switch, Route} from 'react-router-dom';

import Amplify from '@aws-amplify/core'
import awsConfig from "./configs/aws-configs";

import {AboutUs} from './components/info/AboutUs';
import {GetInvolved} from './components/info/GetInvolved';
import {RequestTutor} from './components/info/RequestTutor';
import {Contacts} from './components/info/Contacts';
import {Home} from './components/info/Home';
import {Process} from './components/info/Process';

import {AnonymousUserScreen} from "./components/auth/AnonymousUserScreen";
import {LoginScreen} from "./components/auth/LoginScreen";
import {RegisterScreen} from "./components/auth/RegisterScreen";
import {ConfirmScreen} from "./components/auth/ConfirmScreen";
import {LogoutScreen} from "./components/auth/LogoutScreen";
import {ChangePasswordScreen} from "./components/auth/ChangePasswordScreen";
import {InitiatePasswordResetScreen} from "./components/auth/InitiatePasswordResetScreen";
import {ConfirmPasswordResetScreen} from "./components/auth/ConfirmPasswordResetScreen";
import {DeleteScreen} from "./components/auth/DeleteScreen";

import {ProfileScreen} from "./components/profile/ProfileScreen";
import {MyCalendarScreen} from "./components/calendar/MyCalendarScreen";
import {CreateAvailabilityScreen} from "./components/calendar/CreateAvailabilityScreen";
import {DeleteAvailabilityScreen} from "./components/calendar/DeleteAvailabilityScreen";


// TODO add blue
Amplify.configure(awsConfig);

const App = () => {
  return (
    <div className="App">
      <Switch>
        <Route exact path="/" component={Home}/>
        <Route path="/home" component={Home}/>
		<Route path="/home" component={Home}/>
        <Route path="/about-us" component={AboutUs}/>
        <Route path="/process" component= {Process}/>
        <Route path="/get-involved" component={GetInvolved}/>
        <Route path="/request-a-tutor" component={RequestTutor}/>
        <Route path="/contacts" component={Contacts}/>

        <Route path={"/anonymous-user"} component={AnonymousUserScreen}/>
        <Route path={"/login"} component={LoginScreen}/>
        <Route path={"/register"} component={RegisterScreen}/>
        <Route path={"/confirm"} component={ConfirmScreen}/>
        <Route path={"/logout"} component={LogoutScreen}/>
        <Route path={"/change-password"} component={ChangePasswordScreen}/>
        <Route path={"/initiate-password-reset"} component={InitiatePasswordResetScreen}/>
        <Route path={"/confirm-password-reset"} component={ConfirmPasswordResetScreen}/>
        <Route path={"/delete-account"} component={DeleteScreen}/>

        <Route path={"/profile"} component={ProfileScreen}/>
        <Route path={"/my-calendar"} component={MyCalendarScreen}/>
        <Route path={"/create-availability"} component={CreateAvailabilityScreen}/>
        <Route path={"/delete-availability"} component={DeleteAvailabilityScreen}/>

      </Switch>
    </div>
  );
}

export default App;
