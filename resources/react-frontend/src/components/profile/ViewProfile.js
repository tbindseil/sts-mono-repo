import React from 'react';

export function ViewProfile(props) {
  return (
    <>
        <h4>
          First Name:
        </h4>
        <p>
          {props.profile.firstName}
        </p>

        <h4>
          Last Name:
        </h4>
        <p>
          {props.profile.lastName}
        </p>

        <h4>
          School:
        </h4>
        <p>
          {props.profile.school}
        </p>

        <h4>
          Grade:
        </h4>
        <p>
          {props.profile.grade}
        </p>

        <h4>
          Bio:
        </h4>
        <p>
          {props.profile.bio}
        </p>

        <button onClick={props.modifyOnClickHandler}>
            Modify
        </button>
    </>
  );
}
