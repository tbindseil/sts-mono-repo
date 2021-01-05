import * as cdk from "@aws-cdk/core";
import * as rds from '@aws-cdk/aws-rds';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import * as iam from '@aws-cdk/aws-iam';
import * as ec2 from '@aws-cdk/aws-ec2';

export interface RDSStackProps extends cdk.StackProps {
    vpc: ec2.Vpc;
}


// use lambda.Code.fromAssetImage its not deprecated for grabbing zip file for lambda
export class RDSStack extends cdk.Stack {

    readonly dbSecret: rds.DatabaseSecret;
    readonly postgresRDSInstance: rds.DatabaseInstance;

    constructor(scope: cdk.App, id: string, props: RDSStackProps) {
        super(scope, id, props);

        this.dbSecret = new rds.DatabaseSecret(this, 'DbSecret', {
            username: 'tj'
        });

        this.postgresRDSInstance = new rds.DatabaseInstance(this, 'Postgres-rds-instance', {
            engine: rds.DatabaseInstanceEngine.postgres({
                version: rds.PostgresEngineVersion.VER_12_4
            }),
            instanceType: new ec2.InstanceType('t2.micro'),
            vpc: props.vpc,
            vpcSubnets: {subnetType: ec2.SubnetType.PUBLIC},
            storageEncrypted: false, // t2.micro doesn't support encryption at rest
            multiAz: false,
            autoMinorVersionUpgrade: false,
            allocatedStorage: 25,
            storageType: rds.StorageType.GP2,
            deletionProtection: false,
            credentials: rds.Credentials.fromSecret(this.dbSecret, 'tj'),
            databaseName: 'Reporting',
            port: 3306,
        });
        this.postgresRDSInstance.connections.allowFromAnyIpv4(ec2.Port.tcp(3306))
    }

    grantDeployPrivileges(user: iam.User) {
        // this creates two way dependency between this and user stack and had to be added after
        // this.dbSecret.grantRead(user);
        user.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonRDSFullAccess'));

        user.addToPrincipalPolicy(new iam.PolicyStatement({
            actions: [
                'rds:CreateDBSubnetGroup',
                'secretsmanager:DeleteSecret',
                'secretsmanager:GetRandomPassword',
                'secretsmanager:CreateSecret',
                'secretsmanager:TagResource',
                'secretsmanager:GetSecretValue',
                'secretsmanager:PutSecretValue'
            ],
            resources: [
                '*'
            ]
        }));
    }
}
