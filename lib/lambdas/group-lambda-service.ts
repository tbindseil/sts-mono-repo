import { Construct, Duration } from '@aws-cdk/core';
import { Cors, LambdaIntegration, RestApi } from "@aws-cdk/aws-apigateway";
import { Code, Function, Runtime } from "@aws-cdk/aws-lambda";
import { DatabaseSecret } from '@aws-cdk/aws-rds';
import { Effect, PolicyStatement } from '@aws-cdk/aws-iam';

export interface GroupLambdaServiceProps {
    dbSecret: DatabaseSecret;
}

export class GroupLambdaService extends Construct {
    constructor(scope: Construct, id: string, props: GroupLambdaServiceProps) {
        super(scope, id);

        const handler = new Function(this, "GroupHandler", {
            runtime: Runtime.PYTHON_3_8,
            code: Code.fromAsset("resources/group-lambda/my-deployment-package.zip"),
            handler: "lambda_function.lambda_handler",
            timeout: Duration.seconds(29)
        });
        props.dbSecret.grantRead(handler.role!);
        handler.addToRolePolicy(new PolicyStatement({
            actions: ['ses:SendEmail', 'ses:SendRawEmail'],
            resources: ['*'],
            effect: Effect.ALLOW,
        }));

        const api = new RestApi(this, "group-api", {
            restApiName: "Group Service",
            description: "Rest api for a user's group.",
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

        const postGroupIntegration = new LambdaIntegration(handler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' },
            timeout: Duration.seconds(29)
        });

        const group = api.root.addResource("{group-id}");

        const getGroupIntegration = new LambdaIntegration(handler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' },
            timeout: Duration.seconds(29)
        });

        // Remove a specific group from the db with: DELETE /{group-id}
        const deleteGroupIntegration = new LambdaIntegration(handler, {
            timeout: Duration.seconds(29)
        });

        const groupMember = group.addResource("member");
        const groupMemberMember = groupMember.addResource("{member-id}");
        const groupAdmin = group.addResource("admin");
        const groupAdminAdmin = groupAdmin.addResource("{admin-id}");

        const postGroupMemberIntegration = new LambdaIntegration(handler, {
            timeout: Duration.seconds(29)
        });
        const deleteGroupMemberIntegration = new LambdaIntegration(handler, {
            timeout: Duration.seconds(29)
        });
        const postGroupAdminIntegration = new LambdaIntegration(handler, {
            timeout: Duration.seconds(29)
        });
        const deleteGroupAdminIntegration = new LambdaIntegration(handler, {
            timeout: Duration.seconds(29)
        });

        api.root.addMethod("POST", postGroupIntegration); // POST /
        group.addMethod("GET", getGroupIntegration); // GET /{group-id}
        group.addMethod("DELETE", deleteGroupIntegration); // DELETE /{group-id}

        groupMemberMember.addMethod("POST", postGroupMemberIntegration); // POST /{group-id}/member/{member-id}
        groupMemberMember.addMethod("DELETE", deleteGroupMemberIntegration); // DELETE /{group-id}/member/{member-id}
        groupAdminAdmin.addMethod("POST", postGroupAdminIntegration); // POST /{group-id}/admin/{admin-id}
        groupAdminAdmin.addMethod("DELETE", deleteGroupAdminIntegration); // DELETE /{group-id}/admin/{admin-id}
    }
}
