import { Construct, Duration } from '@aws-cdk/core';
import { Cors, LambdaIntegration, RestApi } from "@aws-cdk/aws-apigateway";
import { Code, Function, Runtime } from "@aws-cdk/aws-lambda";
import { DatabaseSecret } from '@aws-cdk/aws-rds';

export interface InquiryLambdaServiceProps {
    dbSecret: DatabaseSecret;
}

export class InquiryLambdaService extends Construct {
    constructor(scope: Construct, id: string, props: InquiryLambdaServiceProps) {
        super(scope, id);

        const handler = new Function(this, "InquiryHandler", {
            runtime: Runtime.PYTHON_3_8,
            code: Code.fromAsset("resources/inquiry-lambda/my-deployment-package.zip"),
            handler: "lambda_function.lambda_handler",
            timeout: Duration.seconds(29)
        });
        props.dbSecret.grantRead(handler.role!);

        const api = new RestApi(this, "inquiry-api", {
            restApiName: "Inquiry Service",
            description: "Rest api for a user's inquiry.",
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowCredentials: true,
                allowHeaders:
                [
                    "Content-Type",
                    "X-Amz-Date",
                    "Authorization",
                    "X-Api-Key",
                    "X-Amz-Security-Token",
                    "access-control-allow-credentials",
                    "access-control-allow-origin",
                    "access-control-allow-headers",
                ]
            }
        });

        const postInquiryIntegration = new LambdaIntegration(handler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' },
            timeout: Duration.seconds(29)
        });

        const getInquriesIntegration = new LambdaIntegration(handler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' },
            timeout: Duration.seconds(29)
        });

        const inquiry = api.root.addResource("{inquiry-id}");

        // adjust a specific inquiry from the db with: PUT /{inquiry-id}
        const putInquiryIntegration = new LambdaIntegration(handler, {
            timeout: Duration.seconds(29)
        });

        api.root.addMethod("GET", getInquriesIntegration); // GET /
        api.root.addMethod("POST", postInquiryIntegration); // POST /
        inquiry.addMethod("DELETE", putInquiryIntegration); // PUT /{inquiry-id}
    }
}
