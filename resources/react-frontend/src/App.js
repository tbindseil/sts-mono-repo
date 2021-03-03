import React from 'react';
import './App.css';
import {Switch, Route} from 'react-router-dom';

import Amplify from '@aws-amplify/core'
import awsConfig from "./configs/aws-configs";

import {AboutUs} from './components/AboutUs';
import {GetInvolved} from './components/GetInvolved';
import {RequestTutor} from './components/RequestTutor';
import {Contacts} from './components/Contacts';
import {Home} from './components/Home';
import {Process} from './components/Process';

import {AnonymousUserScreen} from "./components/auth/AnonymousUserScreen";
import {Login} from "./components/auth/Login";
import {Register} from "./components/auth/Register";
import {Confirm} from "./components/auth/Confirm";
import {Logout} from "./components/auth/Logout";
import {ChangePassword} from "./components/auth/ChangePassword";
import {InitiatePasswordReset} from "./components/auth/InitiatePasswordReset";
import {ConfirmPasswordReset} from "./components/auth/ConfirmPasswordReset";
import {Delete} from "./components/auth/Delete";

import {ProfileScreen} from "./components/profile/ProfileScreen";
import {MyCalendarScreen} from "./components/calendar/MyCalendarScreen";
import {CreateAvailabilityScreen} from "./components/calendar/CreateAvailabilityScreen";
import {DeleteAvailabilityScreen} from "./components/calendar/DeleteAvailabilityScreen";


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
        <Route path={"/login"} component={Login}/>
        <Route path={"/register"} component={Register}/>
        <Route path={"/confirm"} component={Confirm}/>
        <Route path={"/logout"} component={Logout}/>
        <Route path={"/change-password"} component={ChangePassword}/>
        <Route path={"/initiate-password-reset"} component={InitiatePasswordReset}/>
        <Route path={"/confirm-password-reset"} component={ConfirmPasswordReset}/>
        <Route path={"/delete-account"} component={Delete}/>

        <Route path={"/profile"} component={ProfileScreen}/>
        <Route path={"/my-calendar"} component={MyCalendarScreen}/>
        <Route path={"/create-availability"} component={CreateAvailabilityScreen}/>
        <Route path={"/delete-availability"} component={DeleteAvailabilityScreen}/>

      </Switch>
    </div>
  );
}

export default App;
