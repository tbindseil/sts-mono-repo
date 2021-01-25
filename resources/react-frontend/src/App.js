import './App.css';
import {Layout} from './components/Layout';
import {Switch, Route} from 'react-router-dom';

const App = () => {
  // TODO compose Switch somehow?
  return (
    <div className="App">
      <Switch>
        <Route exact path="/" component={Home}/>
		 <Route path="/home" component={Home}/>
        <Route path="/about-us" component={AboutUs}/>
        <Route path="/get-involved" component={GetInvolved}/>
        <Route path="/request-a-tutor" component={RequestATutor}/>
        <Route path="/contacts" component={Contacts}/>
      </Switch>
    </div>
  );
}

const Home = () => {
  const horizontalBreakStyle = {
    backgroundColor: "grey",
    height: "20px"
  };

  const sectionStyle = {
    border: '10px solid #005D8c'
  };


  return (
    <Layout
      title="Students Teaching Students"
      text="Enhancing education with student to student tutoring"
    />
  );
}

const AboutUs = () => {
  return (
    <Layout
      title="About Us"
      text="Our vision is to find high-performing students that have the ability and desire to build their leadership and technical skills by tutoring. Students Teaching Students is a nonprofit organization that connects those students with other students that can benefit from their tutoring. We have a passion for education and want to empower other like-minded individuals to tutor if they have the desire to do so. Unlike other tutoring organizations, we contact the vast resource of students that excel in an area to share their knowledge with others. Students are motivated, more acclimated to specific lesson plans, and are always looking for unique leadership opportunities."
    />
  );
}

const GetInvolved = () => {
  return (
    <Layout
      title="Get Involved"
      text="We are always looking for new tutors to join our team. If you are passionate about helping others and believe you can share your knowledge with other students fill out the survey below to get involved. In addition to tutors we are looking for high performing students to fill the role of lead tutor. This position gives you real world experience developing skills like project management, recruiting, scheduling and others. The same survey below will allow you to mark your interest in becoming a lead tutor."
		link= <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSetv8vY2dH-ur938u0qKqJchiEnqry9ivWc0tDHmnED5epPYA/viewform?embedded=true" width="700" height="520" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
	/>
  );
}

const RequestATutor = () => {
  return (
    <Layout
      title="Request a Tutor"
      text="Students Teaching Students is a nonprofit tutoring organization that matches students with other students in there area for free tutoring service. If you are looking for test prep, homework help, or just to better understand a subject, visit the link below to request a tutor that fits all of your subject and schedule needs."
    link=<iframe src="https://docs.google.com/forms/d/e/1FAIpQLSf4uPCMvxLew5migtPBZwiavpJRrS24SdE9XbYlScTLzEpdeQ/viewform?embedded=true" width="700" height="520" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
	/>
  );
}

const Contacts = () => {
  return (
    <Layout
      title="Contacts"
      text="Feel free to reach out to us with any questions, concerns, or suggestions for our organization. We are always working to improve, and would love to hear from you!" 
	  link= <a href="mailto:bjkearbey@studentsts.org"> Email: bjkearbey@studentsts.org</a>
    />
  );
}

export default App;