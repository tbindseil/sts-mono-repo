import { Construct, StackProps, Stack } from '@aws-cdk/core';
import { AuthorizationType, CfnAuthorizer, Cors, LambdaIntegration, RestApi } from "@aws-cdk/aws-apigateway";
import { Code, Function, Runtime } from "@aws-cdk/aws-lambda";
import { DatabaseSecret } from '@aws-cdk/aws-rds';

export interface UserLambdaServiceProps {
    userPoolArn: string;
    dbSecret: DatabaseSecret;
}

export class UserLambdaService extends Construct {
    constructor(scope: Construct, id: string, props: UserLambdaServiceProps) {
        super(scope, id);


        const handler = new Function(this, "UserHandler", {
            runtime: Runtime.PYTHON_3_8,
            code: Code.fromAsset("resources/user-lambda/my-deployment-package.zip"),
            handler: "lambda_function.lambda_handler",
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

        const auth = new CfnAuthorizer(this, 'CognitoAuthorizer', {
            name: "CognitoAuthorizer",
            type: AuthorizationType.COGNITO,
            authorizerResultTtlInSeconds: 300,
            identitySource: "method.request.header.Authorization",
            restApiId: api.restApiId,
            providerArns: [props.userPoolArn],
        });

        const user = api.root.addResource("{user-id}");

        const getUsersIntegration = new LambdaIntegration(handler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' }
        });

        // Add new user to bucket with: PUT /{user-id}
        const putUserIntegration = new LambdaIntegration(handler);

        // Get a specific user from bucket with: GET /{user-id}
        const getUserIntegration = new LambdaIntegration(handler);

        // Remove a specific user from the bucket with: DELETE /{user-id}
        const deleteUserIntegration = new LambdaIntegration(handler);

        api.root.addMethod("GET", getUsersIntegration); // GET /


        // since I don't have a clear authentication plan, I will proceed without any at all
        // the only thought I can document is that I don't know whether an individual users account
        // should be private information. I guess this is where the friends functionality comes in...


        // this one is authorized for now
        user.addMethod("PUT", putUserIntegration); // PUT /{user-id}


        user.addMethod("GET", getUserIntegration); // GET /{user-id}
        user.addMethod("DELETE", deleteUserIntegration); // DELETE /{user-id}
    }
}
