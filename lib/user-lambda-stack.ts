import * as cdk from '@aws-cdk/core';
import { UserLambdaService } from '../lib/user-lambda-service';

// TODO Maybe one lambda stack that takes as an argument a service?
export class UserLambdaServiceStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here
        new UserLambdaService(this, "UserLambdaService");
    }
}
