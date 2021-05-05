import { Construct, StackProps, Stack } from '@aws-cdk/core';
import { ClassLambdaService } from './class-lambda-service';
import { DatabaseSecret } from '@aws-cdk/aws-rds';

export interface ClassLambdaServiceStackProps extends StackProps {
    dbSecret: DatabaseSecret;
}

export class ClassLambdaServiceStack extends Stack {
    constructor(scope: Construct, id: string, props: ClassLambdaServiceStackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here
        new ClassLambdaService(this, "ClassLambdaService", {
            dbSecret: props.dbSecret
        });
    }
}
