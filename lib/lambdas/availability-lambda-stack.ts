import { Construct, StackProps, Stack } from '@aws-cdk/core';
import { AvailabilityLambdaService } from './availability-lambda-service';
import { DatabaseSecret } from '@aws-cdk/aws-rds';

export interface AvailabilityLambdaServiceStackProps extends StackProps {
    dbSecret: DatabaseSecret;
}

export class AvailabilityLambdaServiceStack extends Stack {
    constructor(scope: Construct, id: string, props: AvailabilityLambdaServiceStackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here
        new AvailabilityLambdaService(this, "AvailabilityLambdaService", {
            dbSecret: props.dbSecret
        });
    }
}
