import React from 'react';
import './App.css';
import 'semantic-ui-css/semantic.min.css'

import {Switch, Route} from 'react-router-dom';

import Amplify from '@aws-amplify/core'
import awsConfig from "./configs/aws-configs";

import {AboutUs} from './components/info/AboutUs';
import {Contacts} from './components/info/Contacts';
import {HomeScreen} from './components/info/Home';
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
import {AccountScreen} from "./components/profile/AccountScreen";

import {GroupsScreen} from "./components/groups/GroupsScreen";
import {GroupScreen} from "./components/groups/GroupScreen";
import {CreateGroupScreen} from "./components/groups/CreateGroupScreen";

import {CalendarScreen} from "./components/calendar/CalendarScreen";
import {MyCalendarScreen} from "./components/calendar/MyCalendarScreen";
import {CreateAvailabilityScreen} from "./components/calendar/CreateAvailabilityScreen";
import {SelectAvailabilityScreen} from './components/calendar/SelectAvailabilityScreen';
import {DeleteAvailabilityScreen} from "./components/calendar/DeleteAvailabilityScreen";

// import {TestScreen} from "./components/base-components/TestScreen";

// TODO add blue
Amplify.configure(awsConfig);

const App = () => {
  return (
    <div className="App">
      <Switch>
        <Route exact path="/" component={HomeScreen}/>
        <Route path="/home" component={HomeScreen}/>
        <Route path="/about-us" component={AboutUs}/>
        <Route path="/process" component= {Process}/>
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
        <Route path={"/account"} component={AccountScreen}/>

        <Route path={"/groups"} component={GroupsScreen}/>
        <Route path={"/group"} component={GroupScreen}/>
        <Route path={"/create-group"} component={CreateGroupScreen}/>

        <Route path={"/calendar"} component={CalendarScreen}/>
        <Route path={"/my-calendar"} component={MyCalendarScreen}/>
        <Route path={"/create-availability"} component={CreateAvailabilityScreen}/>
        <Route path={"/select-availability"} component={SelectAvailabilityScreen}/>
        <Route path={"/delete-availability"} component={DeleteAvailabilityScreen}/>

      {
        // <Route path={"/test"} component={TestScreen}/>
      }
      </Switch>
    </div>
  );
}

export default App;
