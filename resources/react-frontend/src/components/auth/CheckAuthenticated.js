import {Auth} from "aws-amplify";

// IDEA change name and use this file as AuthBridge in order to encapsulate all dependencies on aws-amplify Auth

/**
 * checks for authentication status,
 * and takes action if authentication status does not match desired state
 *
 * desired: true if looking for an authenticated user, false if looking for unathenticated
 * action: what to do if user authentication status doesn't match desired state
 */
export function checkAuthenticated(action, setUser) {
   Auth.currentAuthenticatedUser({
       bypassCache: false
   })
       .then(user => {
           setUser(user);
       })
       .catch(err => {
           action();
       });
}

export function checkUnauthenticated(action) {
   Auth.currentAuthenticatedUser({
       bypassCache: false
   })
       .then(user => {
           action();
       })
       .catch(err => {
           // expected
       });
}
