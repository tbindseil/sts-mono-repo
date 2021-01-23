#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { UsersStack } from '../lib/users-stack';
import { VpcStack } from '../lib/vpc-stack';
import { RDSStack } from "../lib/rds-stack";
import { MyWidgetServiceStack } from "../lib/my_widget_service-stack";
import { UserLambdaServiceStack } from "../lib/user-lambda-stack";

const app = new cdk.App();

const userStack = new UsersStack(app, 'UsersStack');

const vpcStack = new VpcStack(app, 'VpcStack');
const rdsStack = new RDSStack(app, 'RDSStack', {
    vpc: vpcStack.vpc
});

const myWidgetServiceStack = new MyWidgetServiceStack(app, 'MyWidgetServiceStack');
const myUserServiceStack = new UserLambdaServiceStack(app, 'UserLambdaServiceStack');

vpcStack.grantDeployPrivileges(userStack.buildScriptsUser);
rdsStack.grantDeployPrivileges(userStack.buildScriptsUser);
