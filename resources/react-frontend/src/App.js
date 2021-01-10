import logo from './logo.svg';
import './App.css';
import {Switch, Route, Link} from 'react-router-dom';

const App = () => {
  return (
    <div className="App">
      <Switch>
        <Route exact path="/" component={Home}/>
        <Route path="/register" component={Register}/>
        <Route path="/signin" component={SignIn}/>
      </Switch>
    </div>
  );
}

const Home = () => {
  return (
    <div className="Home">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <p>
          Welcome to Students Teaching Students!
        <br/>
          We empower students to help other students.
        </p>

        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/register">Register</Link>
          </li>
          <li>
            <Link to="/signin">Sign In</Link>
          </li>
        </ul>
      </header>

    </div>
  );
}

const Register = () => {
  return (
    <div className="Register">
      <header className="App-header">
        <p>
          Register here.
        </p>
      </header>
    </div>
  );
}

const SignIn = () => {
  return (
    <div className="SignIn">
      <header className="App-header">
        <p>
          Sign in here.
        </p>
      </header>
    </div>
  );
}

export default App;
