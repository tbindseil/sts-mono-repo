import './App.css';
import {Switch, Route} from 'react-router-dom';

import Amplify from '@aws-amplify/core'
import awsConfig from "./configs/aws-configs";

import {AboutUs} from './components/AboutUs';
import {GetInvolved} from './components/GetInvolved';
import {RequestTutor} from './components/RequestTutor';
import {Contacts} from './components/Contacts';
import {Home} from './components/Home';

import {AnonymousUser} from "./components/auth/AnonymousUser";
import {Login} from "./components/auth/Login";
import {Register} from "./components/auth/Register";
import {Confirm} from "./components/auth/Confirm";
import {Logout} from "./components/auth/Logout";

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

        <Route path={"/anonymous-user"} component={AnonymousUser}/>
        <Route path={"/login"} component={Login}/>
        <Route path={"/register"} component={Register}/>
        <Route path={"/confirm"} component={Confirm}/>
        <Route path={"/logout"} component={Logout}/>

        <Route path={"/profile"} component={Profile}/>

      </Switch>
    </div>
  );
}

export default App;
