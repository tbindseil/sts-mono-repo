import logo from './logo_no_outline.svg';
import './App.css';
import {Header} from './components/Header';
import {Layout} from './components/Layout';
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
    <Layout text="About Us"/>
  );
}

const GetInvolved = () => {
  return (
    <Layout text="Get Involved"/>
  );
}

const RequestATutor = () => {
  return (
    <Layout text="Request a Tutor"/>
  );
}

const Contacts = () => {
  return (
    <Layout text="Contacts"/>
  );
}

export default App;
