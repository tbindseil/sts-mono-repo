import React from 'react';
import { useMediaQuery } from 'react-responsive'

function ScreenSizeConfigurableException(message) {
  this.message = message;
  this.name = 'UserException';
}

export function ScreenSizeConfigurable(props) {

    const bigScreen = useMediaQuery({ query: '(min-width: 765px)' });

    const wrapped = React.Children.only(props.children);
    console.log("wrapped is:");
    console.log(wrapped);
    console.log("done wrapped is:");

    // only works for basic stuff
    const proops = {
        ...props,
        className: bigScreen ? props.bigScreenClassName : props.smallScreenClassName
    };
    delete proops.children;

    console.log("proops is;");
    console.log(proops);
    console.log("props is;");
    console.log(props);

    switch (wrapped.type) {
        case 'p':
            return <p {...proops}> {props.children} </p>;
        default:
            console.log("throwing");
            throw new ScreenSizeConfigurableException(`type ${wrapped.type} not yet supported`);
    }
}
