import { Construct, StackProps, Stack } from '@aws-cdk/core';
import { AuthorizationType, CfnAuthorizer, LambdaIntegration, RestApi } from "@aws-cdk/aws-apigateway";
import { Code, IFunction, Function, Runtime } from "@aws-cdk/aws-lambda";

export class UserRegisteredService extends Construct {
    public readonly handler: IFunction;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id);


        this.handler = new Function(this, "UserRegisteredHandler", {
            runtime: Runtime.PYTHON_3_8,
            code: Code.fromAsset("resources/user-registered-lambda/my-deployment-package.zip"),
            handler: "lambda_function.lambda_handler",
        });
    }
}
