import React from 'react';
import { useMediaQuery } from 'react-responsive'

function ScreenSizeConfigurableException(message) {
  this.message = message;
  this.name = 'UserException';
}

export function ScreenSizeConfigurable(props) {

    const bigScreen = useMediaQuery({ query: '(min-width: 765px)' });

    const wrapped = React.Children.only(props.children);

    // only works for basic stuff
    const proops = {
        ...props,
        className: bigScreen ? props.bigScreenClassName : props.smallScreenClassName
    };
    delete proops.children;

    switch (wrapped.type) {
        case 'p':
            return <p {...proops}> {props.children.props.children} </p>;
        case 'div':
            return <div {...proops}> {props.children.props.children} </div>;
        default:
            throw new ScreenSizeConfigurableException(`type ${wrapped.type} not yet supported`);
    }
}
