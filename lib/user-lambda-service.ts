import { Construct, StackProps, Stack } from '@aws-cdk/core';
import { AuthorizationType, CfnAuthorizer, LambdaIntegration, RestApi } from "@aws-cdk/aws-apigateway";
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

        // TODO configure PUT allowed method and allow-method-header on options method in cdk
        // integration response configured as follows:
        // Access-Control-Allow-Headers	'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,access-control-allow-credentials,access-control-allow-origin,access-control-allow-headers'
        // Access-Control-Allow-Origin	'*'
        // Access-Control-Allow-Credentials
        // Access-Control-Allow-Methods	'DELETE,GET,OPTIONS,PUT'

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

        // TODO use cognito username, as it is uid rather than personal data
        const user = api.root.addResource("{email}");

        // TODO probably don't need authoriztion on the api level anymore, since authentication
        // access to a particular resource will still have to be determined
        const authorizationOptions = {
            apiKeyRequired: false,
            authorizer: {authorizerId: auth.ref},
            authorizationType: AuthorizationType.COGNITO
        };

        const getUsersIntegration = new LambdaIntegration(handler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' }
        });

        // Add new user to bucket with: PUT /{email}
        const putUserIntegration = new LambdaIntegration(handler);

        // Get a specific user from bucket with: GET /{email}
        const getUserIntegration = new LambdaIntegration(handler);

        // Remove a specific user from the bucket with: DELETE /{email}
        const deleteUserIntegration = new LambdaIntegration(handler);

        api.root.addMethod("GET", getUsersIntegration); // GET /


        // since I don't have a clear authentication plan, I will proceed without any at all
        // the only thought I can document is that I don't know whether an individual users account
        // should be private information. I guess this is where the friends functionality comes in...


        // this one is authorized for now
        user.addMethod("PUT", putUserIntegration); // , authorizationOptions); // PUT /{email}



        user.addMethod("GET", getUserIntegration); // GET /{email}
        user.addMethod("DELETE", deleteUserIntegration); // DELETE /{email}
    }
}
