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

        const authorizationOptions = {
            apiKeyRequired: false,
            authorizer: {authorizerId: auth.ref},
            authorizationType: AuthorizationType.COGNITO
        };

        const getUsersIntegration = new LambdaIntegration(handler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' }
        });

        // Add new user to bucket with: POST /{email}
        const postUserIntegration = new LambdaIntegration(handler);

        // Get a specific user from bucket with: GET /{email}
        const getUserIntegration = new LambdaIntegration(handler);

        // Remove a specific user from the bucket with: DELETE /{email}
        const deleteUserIntegration = new LambdaIntegration(handler);

        api.root.addMethod("GET", getUsersIntegration); // GET /


        // since I don't have a clear authentication plan, I will proceed without any at all
        // the only thought I can document is that I don't know whether an individual users account
        // should be private information. I guess this is where the friends functionality comes in...


        // this one is authorized for now
        user.addMethod("POST", postUserIntegration); // , authorizationOptions); // POST /{email}



        user.addMethod("GET", getUserIntegration); // GET /{email}
        user.addMethod("DELETE", deleteUserIntegration); // DELETE /{email}
    }
}
