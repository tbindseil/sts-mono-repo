import { Construct, Duration } from '@aws-cdk/core';
import { Cors, LambdaIntegration, RestApi } from "@aws-cdk/aws-apigateway";
import { Code, Function, Runtime } from "@aws-cdk/aws-lambda";
import { DatabaseSecret } from '@aws-cdk/aws-rds';

export interface UserLambdaServiceProps {
    dbSecret: DatabaseSecret;
}

export class UserLambdaService extends Construct {
    constructor(scope: Construct, id: string, props: UserLambdaServiceProps) {
        super(scope, id);

        const handler = new Function(this, "UserHandler", {
            runtime: Runtime.PYTHON_3_8,
            code: Code.fromAsset("resources/user-lambda/my-deployment-package.zip"),
            handler: "lambda_function.lambda_handler",
            timeout: Duration.seconds(29)
        });
        props.dbSecret.grantRead(handler.role!);

        const api = new RestApi(this, "users-api", {
            restApiName: "User Service",
            description: "This service serves users.",
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

        const user = api.root.addResource("{user-id}");

        const getUsersIntegration = new LambdaIntegration(handler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' },
            timeout: Duration.seconds(29)
        });

        // update user with: PUT /{user-id}
        const putUserIntegration = new LambdaIntegration(handler, {
            timeout: Duration.seconds(29)
        });

        // Add new user with: POST /
        const postUserIntegration = new LambdaIntegration(handler, {
            timeout: Duration.seconds(29)
        });

        // Get a specific user with: GET /{user-id}
        const getUserIntegration = new LambdaIntegration(handler, {
            timeout: Duration.seconds(29)
        });

        // delete a specific user with: DELETE /{user-id}
        const deleteUserIntegration = new LambdaIntegration(handler, {
            timeout: Duration.seconds(29)
        });

        api.root.addMethod("GET", getUsersIntegration); // GET /

        user.addMethod("PUT", putUserIntegration); // PUT /{user-id}
        api.root.addMethod("POST", postUserIntegration); // POST /
        user.addMethod("GET", getUserIntegration); // GET /{user-id}
        user.addMethod("DELETE", deleteUserIntegration); // DELETE /{user-id}
    }
}
