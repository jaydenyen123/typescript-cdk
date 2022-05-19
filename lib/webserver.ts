import {aws_ecr_assets, aws_ec2 as ec2, aws_ecs as ecs, aws_ecs_patterns as escp, CfnOutput} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import * as apigv2 from '@aws-cdk/aws-apigatewayv2-alpha'

interface DocumentManagementWebserverProps {
    vpc: ec2.IVpc,
    api: apigv2.HttpApi
}

export class DocumentManagementWebserver extends Construct {
    constructor(scope: Construct, id: string, props: DocumentManagementWebserverProps) {
        super(scope, id);

        const webserverDocker = new aws_ecr_assets.DockerImageAsset(this, "WebserverDockerAsset", {
            directory: path.join(__dirname, '..', 'containers', 'webserver')
        });
        const fargateService = new escp.ApplicationLoadBalancedFargateService(this, "WebserverFargateService", {
            vpc: props.vpc,
            taskImageOptions: {
                image: ecs.ContainerImage.fromDockerImageAsset(webserverDocker),
                environment: {
                    SERVER_PORT: "8080",
                    API_BASE: props.api.url!
                },
                containerPort: 8080
            }
        });

        new CfnOutput(this, "WebserverHost", {
            exportName: "WenserverHost",
            value: fargateService.loadBalancer.loadBalancerDnsName
        })
    }
}