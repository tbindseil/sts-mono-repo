import React from 'react';
import MediaQuery from 'react-responsive';

import stock_photo from '../../images/books.jpg';
import course from '../../images/course.PNG';

import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';

const sideBy = {
  display: 'flex',
};

// TODO this one (and process) is a weird one that doesn't fit the easy basescreen format
export const AboutUs = () => (

    <div>

        <Header/>

        <MediaQuery minWidth={765}>

            <header className="PageBorder">

                <Title
                    titleText={"About Students Teaching Students"}
                    underlineClass={"Underline"}/>

                <section style={sideBy}>

                    <AboutUsBody
                        sideTextClass={"SideText"}/>

                    <img className="SmallImg" src={stock_photo} alt="stock"/>

                </section>

                <AboutUsTutotingOffered
                    underlineClass={"Underline"}
                    textClass={"SideText3"}
                    imgClass={"MediumImg"}/>

            </header>
        </MediaQuery>

        <MediaQuery maxWidth={765}>

            <header className="PageBorder2">

                <Title
                    titleText={"About Students Teaching Students"}
                    underlineClass={"Underline"}/>

                <AboutUsBody
                    sideTextClass={"SideText2"}/>

                <AboutUsTutotingOffered
                    underlineClass={"Underline2"}
                    textClass={"SideText2"}
                    imgClass={"LargeImg"}/>

            </header>

        </MediaQuery>

        <Bottom/>

    </div>
);

function AboutUsBody(props) {
    return (
        <>
            <div>
                <p className={props.sideTextClass}>

                    <h4 className="PageHeader">
                        Vision
                    </h4>

                    Students Teaching Students is a non-profit tutoring organization
                    that provides free tutoring for any student seeking additional help with their schoolwork.
                    <br/>
                    <br/>

                    Free academic tutoring is at the forefront of our organization, but the backbone is what really sets us apart.
                    We seek out high-performing high school students from various locations and subject matters to become tutors.
                    <br/>
                    <br/>

                    Students are motivated and familiar with the lesson plans of a specific district.
                    With training and structure from Students Teaching Students, they can become great tutors.
                    <br/>
                    <br/>

                    With a large pool of student tutors, we are able to effectively connect them with students
                    looking for additional help in various grades, subjects, or school locations.
                    This is how we plan to achieve our goal of providing tutoring to all those who seek it. At the same time,
                    we will provide opportunities for high achieving students to give back to their school and community.

                </p>
            </div>
        </>
    );
}

function AboutUsTutotingOffered(props) {
    return (
        <>
            <h2 className="PageHeader">
                Tutoring Offered
            </h2>

            <hr className={props.underlineClass}/>

            <section>

                <div>
                    <p className={props.textClass}>
                        **We are actively working through our network of Chicago and Chicago Suburb based schools to form partnerships
                        with the various districts. As those partnerships are established,
                        this section will be updated with the grade levels, subjects, and locations tutoring is offered.
                    </p>
                </div>

                <img className={props.imgClass} src={course} alt="stock"/>

            </section>
        </>
    );
}
