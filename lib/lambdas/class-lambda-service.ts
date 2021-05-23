import { Construct, Duration } from '@aws-cdk/core';
import { Cors, LambdaIntegration, RestApi } from "@aws-cdk/aws-apigateway";
import { Code, Function, Runtime } from "@aws-cdk/aws-lambda";
import { DatabaseSecret } from '@aws-cdk/aws-rds';

export interface ClassLambdaServiceProps {
    dbSecret: DatabaseSecret;
}

export class ClassLambdaService extends Construct {
    constructor(scope: Construct, id: string, props: ClassLambdaServiceProps) {
        super(scope, id);

        const handler = new Function(this, "ClassHandler", {
            runtime: Runtime.PYTHON_3_8,
            code: Code.fromAsset("resources/Class-lambda/my-deployment-package.zip"),
            handler: "lambda_function.lambda_handler",
            timeout: Duration.seconds(29)
        });
        props.dbSecret.grantRead(handler.role!);

        const api = new RestApi(this, "class-api", {
            restApiName: "Class Service",
            description: "Rest api for a class.",
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

        const postClassIntegration = new LambdaIntegration(handler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' },
            timeout: Duration.seconds(29)
        });

        const getAllClassIntegration = new LambdaIntegration(handler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' },
            timeout: Duration.seconds(29)
        });

        const classResource = api.root.addResource("{class-id}");

        // Get a specific class from bucket with: GET /{user-id}
        const getClassIntegration = new LambdaIntegration(handler, {
            timeout: Duration.seconds(29)
        });

        // Remove a specific class from the db with: DELETE /{class-id}
        const deleteClassIntegration = new LambdaIntegration(handler, {
            timeout: Duration.seconds(29)
        });

        // TODO search classes by name..

        api.root.addMethod("POST", postClassIntegration); // POST /
        api.root.addMethod("GET", getAllClassIntegration); // GET /
        classResource.addMethod("GET", getClassIntegration); // GET /{class-id}
        classResource.addMethod("DELETE", deleteClassIntegration); // DELETE /{class-id}
    }
}
