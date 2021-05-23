import { Construct, Duration } from '@aws-cdk/core';
import { Cors, LambdaIntegration, RestApi } from "@aws-cdk/aws-apigateway";
import { Code, Function, Runtime } from "@aws-cdk/aws-lambda";
import { DatabaseSecret } from '@aws-cdk/aws-rds';

export interface AvailabilityLambdaServiceProps {
    dbSecret: DatabaseSecret;
}

export class AvailabilityLambdaService extends Construct {
    constructor(scope: Construct, id: string, props: AvailabilityLambdaServiceProps) {
        super(scope, id);

        const handler = new Function(this, "AvailabilityHandler", {
            runtime: Runtime.PYTHON_3_8,
            code: Code.fromAsset("resources/availability-lambda/my-deployment-package.zip"),
            handler: "lambda_function.lambda_handler",
            timeout: Duration.seconds(29)
        });
        props.dbSecret.grantRead(handler.role!);

        const api = new RestApi(this, "availability-api", {
            restApiName: "Availability Service",
            description: "Rest api for a user's availability.",
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

        const getAvailabilitiesIntegration = new LambdaIntegration(handler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' },
            timeout: Duration.seconds(29)
        });

        const postAvailabilityIntegration = new LambdaIntegration(handler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' },
            timeout: Duration.seconds(29)
        });

        const availability = api.root.addResource("{availability-id}");

        // Remove a specific availability from the db with: DELETE /{availability-id}
        const deleteAvailabilityIntegration = new LambdaIntegration(handler, {
            timeout: Duration.seconds(29)
        });

        api.root.addMethod("GET", getAvailabilitiesIntegration); // GET /
        api.root.addMethod("POST", postAvailabilityIntegration); // POST /
        availability.addMethod("DELETE", deleteAvailabilityIntegration); // DELETE /{availability-id}
    }
}
