import React from 'react';

export function ViewProfile(props) {
  return (
    <>
        <ProfilePiece
            header={"First Name:"}
            content={props.profile.firstName}
        />

        <ProfilePiece
            header={"Last Name:"}
            content={props.profile.lastName}
        />

        <ProfilePiece
            header={"School:"}
            content={props.profile.school}
        />

        <ProfilePiece
            header={"Grade:"}
            content={props.profile.grade}
        />

        <ProfilePiece
            header={"Bio:"}
            content={props.profile.bio}
        />

        <button onClick={props.modifyOnClickHandler}>
            Modify
        </button>
    </>
  );
}

export function ProfilePiece(props) {
    return (
        <>
            <h4>
                {props.header}
            </h4>
            <p>
                {props.content}
            </p>
        </>
    );
}
