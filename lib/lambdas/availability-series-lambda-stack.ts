import { Construct, StackProps, Stack } from '@aws-cdk/core';
import { AvailabilitySeriesLambdaService } from './availability-series-lambda-service';
import { DatabaseSecret } from '@aws-cdk/aws-rds';

export interface AvailabilitySeriesLambdaServiceStackProps extends StackProps {
    dbSecret: DatabaseSecret;
}

export class AvailabilitySeriesLambdaServiceStack extends Stack {
    constructor(scope: Construct, id: string, props: AvailabilitySeriesLambdaServiceStackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here
        new AvailabilitySeriesLambdaService(this, "AvailabilitySeriesLambdaService", {
            dbSecret: props.dbSecret
        });
    }
}
