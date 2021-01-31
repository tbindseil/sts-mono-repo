import './App.css';
import {Switch, Route} from 'react-router-dom';
import {AboutUs} from './components/AboutUs';
import {GetInvolved} from './components/GetInvolved';
import {RequestTutor} from './components/RequestTutor';
import {Contacts} from './components/Contacts';
import {Home} from './components/Home';

const App = () => {
  // TODO compose Switch somehow?
  return (
    <div className="App">
      <Switch>
        <Route exact path="/" component={Home}/>
		 <Route path="/home" component={Home}/>
        <Route path="/about-us" component={AboutUs}/>
        <Route path="/get-involved" component={GetInvolved}/>
        <Route path="/request-a-tutor" component={RequestTutor}/>
        <Route path="/contacts" component={Contacts}/>
      </Switch>
    </div>
  );
}

export default App;