import { Construct, StackProps, Stack } from '@aws-cdk/core';
import { GroupLambdaService } from './group-lambda-service';
import { DatabaseSecret } from '@aws-cdk/aws-rds';

export interface GroupLambdaServiceStackProps extends StackProps {
    dbSecret: DatabaseSecret;
}

export class GroupLambdaServiceStack extends Stack {
    constructor(scope: Construct, id: string, props: GroupLambdaServiceStackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here
        new GroupLambdaService(this, "GroupLambdaService", {
            dbSecret: props.dbSecret
        });
    }
}
