import { Construct, StackProps, Stack } from '@aws-cdk/core';
import { InquiryLambdaService } from './inquiry-lambda-service';
import { DatabaseSecret } from '@aws-cdk/aws-rds';

export interface InquiryLambdaServiceStackProps extends StackProps {
    dbSecret: DatabaseSecret;
}

export class InquiryLambdaServiceStack extends Stack {
    constructor(scope: Construct, id: string, props: InquiryLambdaServiceStackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here
        new InquiryLambdaService(this, "InquiryLambdaService", {
            dbSecret: props.dbSecret
        });
    }
}
