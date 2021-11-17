import { Construct, Duration } from '@aws-cdk/core';
import { Cors, LambdaIntegration, RestApi } from "@aws-cdk/aws-apigateway";
import { Code, Function, Runtime } from "@aws-cdk/aws-lambda";
import { DatabaseSecret } from '@aws-cdk/aws-rds';
import { Effect, PolicyStatement } from '@aws-cdk/aws-iam';

export interface AvailabilitySeriesLambdaServiceProps {
    dbSecret: DatabaseSecret;
}

export class AvailabilitySeriesLambdaService extends Construct {
    constructor(scope: Construct, id: string, props: AvailabilitySeriesLambdaServiceProps) {
        super(scope, id);

        const handler = new Function(this, "AvailabilitySeriesHandler", {
            runtime: Runtime.PYTHON_3_8,
            code: Code.fromAsset("resources/availability-series-lambda/my-deployment-package.zip"),
            handler: "lambda_function.lambda_handler",
            timeout: Duration.seconds(29)
        });
        props.dbSecret.grantRead(handler.role!);
        handler.addToRolePolicy(new PolicyStatement({
            actions: ['ses:SendEmail', 'ses:SendRawEmail'],
            resources: ['*'],
            effect: Effect.ALLOW,
        }));

        const api = new RestApi(this, "availability-series-api", {
            restApiName: "Availability Series Service",
            description: "Rest api for a user's availability series.",
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

        const postAvailabilitySeriesIntegration = new LambdaIntegration(handler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' },
            timeout: Duration.seconds(29)
        });

        const availabilitySeries = api.root.addResource("{availability-series-id}");

        // Remove a specific availability series from the db with: DELETE /{availability-series-id}
        const deleteAvailabilitySeriesIntegration = new LambdaIntegration(handler, {
            timeout: Duration.seconds(29)
        });

        api.root.addMethod("POST", postAvailabilitySeriesIntegration); // POST /
        availabilitySeries.addMethod("DELETE", deleteAvailabilitySeriesIntegration); // DELETE /{availability-series-id}
    }
}
