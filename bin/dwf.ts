#!/usr/bin/env node
import 'source-map-support/register';
import { App } from '@aws-cdk/core';
import { UsersStack } from '../lib/users-stack';
import { VpcStack } from '../lib/vpc-stack';
import { RDSStack } from "../lib/rds-stack";
import { CognitoStack } from "../lib/cognito-stack";
import { UserLambdaServiceStack } from "../lib/lambdas/user-lambda-stack";
import { AvailabilityLambdaServiceStack } from "../lib/lambdas/availability-lambda-stack";
import { UserRegisteredLambdaServiceStack } from "../lib/lambdas/user-registered-stack";

const app = new App();

const userStack = new UsersStack(app, 'UsersStack');

const vpcStack = new VpcStack(app, 'VpcStack');
const rdsStack = new RDSStack(app, 'RDSStack', {
    vpc: vpcStack.vpc
});

const userRegisteredLambdaServiceStack = new UserRegisteredLambdaServiceStack(app, 'UserRegisteredLambdaServiceStack', {
    dbSecret: rdsStack.dbSecret
});
const cognitoStack = new CognitoStack(app, 'CognitoStack', {
    userRegisteredLambda: userRegisteredLambdaServiceStack.userRegisteredService.handler
});

const userServiceStack = new UserLambdaServiceStack(app, 'UserLambdaServiceStack', {
    dbSecret: rdsStack.dbSecret
});

const availabilityServiceStack = new AvailabilityLambdaServiceStack(app, 'AvailabilityLambdaServiceStack', {
    dbSecret: rdsStack.dbSecret
});

vpcStack.grantDeployPrivileges(userStack.buildScriptsUser);
rdsStack.grantDeployPrivileges(userStack.buildScriptsUser);
