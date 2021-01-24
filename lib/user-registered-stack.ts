import { Construct, StackProps, Stack } from '@aws-cdk/core';
import { UserRegisteredService } from '../lib/user-registered-service';

export class UserRegisteredLambdaServiceStack extends Stack {
    public readonly userRegisteredService: UserRegisteredService;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here
        this.userRegisteredService = new UserRegisteredService(this, "UserLambdaService");
    }
}
