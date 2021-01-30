import { Construct, StackProps, Stack } from '@aws-cdk/core';
import { UserRegisteredService } from '../lib/user-registered-service';
import { DatabaseSecret } from '@aws-cdk/aws-rds';

export interface UserRegisteredLambdaStackProps extends StackProps {
    dbSecret: DatabaseSecret
}

export class UserRegisteredLambdaServiceStack extends Stack {
    public readonly userRegisteredService: UserRegisteredService;

    constructor(scope: Construct, id: string, props: UserRegisteredLambdaStackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here
        this.userRegisteredService = new UserRegisteredService(this, "UserLambdaService", {
            dbSecret: props.dbSecret
        });
    }
}
