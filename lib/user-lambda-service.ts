import { Construct, StackProps, Stack } from '@aws-cdk/core';
import { AuthorizationType, CfnAuthorizer, LambdaIntegration, RestApi } from "@aws-cdk/aws-apigateway";
import { Code, Function, Runtime } from "@aws-cdk/aws-lambda";

export interface UserLambdaServiceProps {
    userPoolArn: string;
}

export class UserLambdaService extends Construct {
    constructor(scope: Construct, id: string, props: UserLambdaServiceProps) {
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

        const auth = new CfnAuthorizer(this, 'CognitoAuthorizer', {
            name: "CognitoAuthorizer",
            type: AuthorizationType.COGNITO,
            authorizerResultTtlInSeconds: 300,
            identitySource: "method.request.header.Authorization",
            restApiId: api.restApiId,
            providerArns: [props.userPoolArn],
        });

        const user = api.root.addResource("{username}");

        const authorizationOptions = {
            apiKeyRequired: false,
            authorizer: {authorizerId: auth.ref},
            authorizationType: AuthorizationType.COGNITO
        };

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



        // this one is authorized for now
        user.addMethod("POST", postUserIntegration, authorizationOptions); // POST /{username}



        user.addMethod("GET", getUserIntegration); // GET /{username}
        user.addMethod("DELETE", deleteUserIntegration); // DELETE /{username}
    }
}
