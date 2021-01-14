import logo from './logo_no_outline.svg';
import './App.css';
import {Header} from './components/Header';
import {Switch, Route} from 'react-router-dom';

const App = () => {
  // TODO compose Switch somehow?
  return (
    <div className="App">
      <Switch>
        <Route exact path="/" component={Home}/>
        <Route path="/about-us" component={AboutUs}/>
        <Route path="/get-involved" component={GetInvolved}/>
        <Route path="/request-a-tutor" component={RequestATutor}/>
        <Route path="/contacts" component={Contacts}/>
      </Switch>
    </div>
  );
}

const Home = () => {
  return (
    <div className="Home">

      <Header/>

      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <p>
          Welcome to Students Teaching Students!
        <br/>
          We empower students to help other students.
        </p>

      </header>

    </div>
  );
}

const AboutUs = () => {
  return (
    <div className="AboutUs">

      <Header/>

      <header className="App-header">
        <p>
          About Us
        </p>
      </header>
    </div>
  );
}

const GetInvolved = () => {
  return (
    <div className="GetInvolved">

      <Header/>

      <header className="App-header">
        <p>
          Get Involved
        </p>
      </header>
    </div>
  );
}

const RequestATutor = () => {
  return (
    <div className="RequestATutor">

      <Header/>

      <header className="App-header">
        <p>
          Request A Tutor
        </p>
      </header>
    </div>
  );
}

const Contacts = () => {
  return (
    <div className="Contacts">

      <Header/>

      <header className="App-header">
        <p>
          Contacts
        </p>
      </header>
    </div>
  );
}

export default App;
