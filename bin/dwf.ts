#!/usr/bin/env node
import 'source-map-support/register';
import { App } from '@aws-cdk/core';
import { UsersStack } from '../lib/users-stack';
import { VpcStack } from '../lib/vpc-stack';
import { RDSStack } from "../lib/rds-stack";
import { CognitoStack } from "../lib/cognito-stack";
import { UserLambdaServiceStack } from "../lib/lambdas/user-lambda-stack";
import { AvailabilityLambdaServiceStack } from "../lib/lambdas/availability-lambda-stack";
import { ClassLambdaServiceStack } from "../lib/lambdas/class-lambda-stack";
import { InquiryLambdaServiceStack } from "../lib/lambdas/inquiry-lambda-stack";
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

const classServiceStack = new ClassLambdaServiceStack(app, 'ClassLambdaServiceStack', {
    dbSecret: rdsStack.dbSecret
});

const inquiryServiceStack = new InquiryLambdaServiceStack(app, 'InquiryLambdaServiceStack', {
    dbSecret: rdsStack.dbSecret
});

vpcStack.grantDeployPrivileges(userStack.buildScriptsUser);
rdsStack.grantDeployPrivileges(userStack.buildScriptsUser);
