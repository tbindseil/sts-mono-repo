import { Construct, StackProps, Stack } from '@aws-cdk/core';
import { UserLambdaService } from '../lib/user-lambda-service';

export interface UserLambdaServiceStackProps extends StackProps {
    userPoolArn: string;
}

// TODO Maybe one lambda stack that takes as an argument a service?
export class UserLambdaServiceStack extends Stack {
    constructor(scope: Construct, id: string, props: UserLambdaServiceStackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here
        new UserLambdaService(this, "UserLambdaService", {
            userPoolArn: props.userPoolArn
        });
    }
}
