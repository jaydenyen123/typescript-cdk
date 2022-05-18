import { Stack, StackProps, aws_s3 as s3, CfnOutput, Tags} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DocumentManagementAPI } from './api';
import { Networking } from './networking';

export class TypescriptCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'DocumentsBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED
    });

    new CfnOutput(this, 'DocumentsBucketNameExport', {
      value: bucket.bucketName,
      exportName: 'DocumentsBucketName'
    })

    const networkingStack = new Networking(this, 'NetworkingConstruct', {
      maxAzs: 2
    })
    Tags.of(networkingStack).add('Module', 'Networking');
    const api = new DocumentManagementAPI(this, 'DocumentManagementAPI');
    Tags.of(api).add('Module', 'API');
  }
}
