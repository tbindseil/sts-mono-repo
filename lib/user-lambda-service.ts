import { Construct, StackProps, Stack } from '@aws-cdk/core';
import { LambdaIntegration, RestApi } from "@aws-cdk/aws-apigateway";
import { Code, Function, Runtime } from "@aws-cdk/aws-lambda";

export class UserLambdaService extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);


        const handler = new Function(this, "UserHandler", {
            runtime: Runtime.PYTHON_3_8,
            code: Code.fromAsset("resources/user-lambda/my-deployment-package.zip"),
            handler: "lambda_function.lambda_handler",
        });

        const api = new RestApi(this, "users-api", {
            restApiName: "User Service",
            description: "This service serves users."
        });

        const user = api.root.addResource("{username}");

        const getUsersIntegration = new LambdaIntegration(handler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' }
        });

        // Add new user to bucket with: POST /{username}
        const postUserIntegration = new LambdaIntegration(handler);

        // Get a specific user from bucket with: GET /{username}
        const getUserIntegration = new LambdaIntegration(handler);

        // Remove a specific user from the bucket with: DELETE /{username}
        const deleteUserIntegration = new LambdaIntegration(handler);

        api.root.addMethod("GET", getUsersIntegration); // GET /

        user.addMethod("POST", postUserIntegration); // POST /{username}
        user.addMethod("GET", getUserIntegration); // GET /{username}
        user.addMethod("DELETE", deleteUserIntegration); // DELETE /{username}
    }
}
