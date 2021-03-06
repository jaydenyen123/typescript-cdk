import { Stack, StackProps, aws_s3 as s3, CfnOutput, Tags, 
  aws_s3_deployment as s3Deploy, aws_iam as iam} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DocumentManagementAPI } from './api';
import { DocumentManagementWebserver } from './webserver';
import { Networking } from './networking';
import * as path from 'path';

export class TypescriptCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'DocumentsBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED
    });

    new s3Deploy.BucketDeployment(this, 'DocumentsDeployment', {
      sources: [
        s3Deploy.Source.asset(path.join(__dirname, '..', 'documents'))
      ],
      destinationBucket: bucket,
      memoryLimit: 512
    })

    new CfnOutput(this, 'DocumentsBucketNameExport', {
      value: bucket.bucketName,
      exportName: 'DocumentsBucketName'
    })

    const networkingStack = new Networking(this, 'NetworkingConstruct', {
      maxAzs: 2
    })

    Tags.of(networkingStack).add('Module', 'Networking');

    const api = new DocumentManagementAPI(this, 'DocumentManagementAPI', {
      documentBucket: bucket
    });
    Tags.of(api).add('Module', 'API');

    const webserver = new DocumentManagementWebserver(this, 'DocumentManagementWebserver', {
      vpc: networkingStack.vpc,
      api: api.httpApi
    })
    Tags.of(webserver).add('Module', 'Webserver');
  }
}