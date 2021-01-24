import { CfnOutput, Construct, StackProps, Stack } from '@aws-cdk/core';
import { UserPool, UserPoolClient } from "@aws-cdk/aws-cognito";

export class CognitoStack extends Stack {
  public readonly userPool: UserPool;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.userPool = new UserPool(this, "UserPool", {
      selfSignUpEnabled: true, // Allow users to sign up
      autoVerify: { email: true }, // Verify email addresses by sending a verification code
      signInAliases: { email: true }, // Set email as an alias
    });

    const userPoolClient = new UserPoolClient(this, "UserPoolClient", {
      userPool: this.userPool,
      generateSecret: false, // Don't need to generate secret for web app running on browsers
    });

    // Export values
    new CfnOutput(this, "UserPoolId", {
      value: this.userPool.userPoolId,
    });
    new CfnOutput(this, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId,
    });
  }
}
