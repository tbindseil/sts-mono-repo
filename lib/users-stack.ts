import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';

export class UsersStack extends cdk.Stack {
    readonly buildScriptsUser: iam.User;
    readonly buildScriptsUserAccessKey: iam.CfnAccessKey;

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.buildScriptsUser = new iam.User(this, 'BuildScriptsUser', {
            userName: 'BuildScriptsUser',
        });
        // TODO minimize the power here, see grantDeployPrivileges
        this.buildScriptsUser.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCloudFormationFullAccess'));
        this.buildScriptsUser.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('IAMFullAccess'));


        this.buildScriptsUserAccessKey = new iam.CfnAccessKey(this, 'myAccessKey', {
            userName: this.buildScriptsUser.userName
        });

        // uncomment if you create a new user and need to see the access key
        // new cdk.CfnOutput(this, 'secretAccessKey', { value: this.buildScriptsUserAccessKey.attrSecretAccessKey });
    }
}
