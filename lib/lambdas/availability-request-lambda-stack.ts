import { Construct, StackProps, Stack } from '@aws-cdk/core';
import { AvailabilityRequestLambdaService } from './availability-request-lambda-service';
import { DatabaseSecret } from '@aws-cdk/aws-rds';

export interface AvailabilityRequestLambdaServiceStackProps extends StackProps {
    dbSecret: DatabaseSecret;
}

export class AvailabilityRequestLambdaServiceStack extends Stack {
    constructor(scope: Construct, id: string, props: AvailabilityRequestLambdaServiceStackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here
        new AvailabilityRequestLambdaService(this, "AvailabilityRequestLambdaService", {
            dbSecret: props.dbSecret
        });
    }
}
