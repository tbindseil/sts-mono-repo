import { Construct, Duration } from '@aws-cdk/core';
import { Cors, LambdaIntegration, RestApi } from "@aws-cdk/aws-apigateway";
import { Code, Function, Runtime } from "@aws-cdk/aws-lambda";
import { DatabaseSecret } from '@aws-cdk/aws-rds';

export interface AvailabilityRequestLambdaServiceProps {
    dbSecret: DatabaseSecret;
}

export class AvailabilityRequestLambdaService extends Construct {
    constructor(scope: Construct, id: string, props: AvailabilityRequestLambdaServiceProps) {
        super(scope, id);

        const handler = new Function(this, "AvailabilityRequestHandler", {
            runtime: Runtime.PYTHON_3_8,
            code: Code.fromAsset("resources/availability-request-lambda/my-deployment-package.zip"),
            handler: "lambda_function.lambda_handler",
            timeout: Duration.seconds(29)
        });
        props.dbSecret.grantRead(handler.role!);

        const api = new RestApi(this, "availability--request-api", {
            restApiName: "Availability Request Service",
            description: "Rest api for requests for an availability.",
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

        const getAvailabilitRequestsIntegration = new LambdaIntegration(handler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' },
            timeout: Duration.seconds(29)
        });

        const postAvailabilityRequestIntegration = new LambdaIntegration(handler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' },
            timeout: Duration.seconds(29)
        });

        const availabilityRequest = api.root.addResource("{availability-request-id}");

        // update avail request with: PUT /{availability-request-id}
        // TODO avail request is identified by body, no need for trailing part of url
        const putAvailabilityRequestIntegration = new LambdaIntegration(handler, {
            timeout: Duration.seconds(29)
        });

        // Remove a specific availability request from the db with: DELETE /{availability-request-id}
        const deleteAvailabilityRequestIntegration = new LambdaIntegration(handler, {
            timeout: Duration.seconds(29)
        });

        api.root.addMethod("GET", getAvailabilitRequestsIntegration); // GET /
        api.root.addMethod("POST", postAvailabilityRequestIntegration); // POST /
        availabilityRequest.addMethod("PUT", putAvailabilityRequestIntegration); // PUT /{availability-reqeust-id}
        availabilityRequest.addMethod("DELETE", deleteAvailabilityRequestIntegration); // DELETE /{availability-reqeust-id}
    }
}
