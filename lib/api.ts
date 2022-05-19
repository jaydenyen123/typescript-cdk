import { aws_lambda_nodejs as lambda, aws_lambda as awslambda, 
    aws_s3 as s3, aws_iam as iam,  Duration as duration, CfnOutput as cfn_output, CfnOutput} from "aws-cdk-lib";
import * as apigv2 from '@aws-cdk/aws-apigatewayv2-alpha'
import * as integration from '@aws-cdk/aws-apigatewayv2-integrations-alpha'
import { Construct } from 'constructs';
import * as path from 'path';
interface DocumentManagementAPIProps {
    documentBucket: s3.IBucket
}

export class DocumentManagementAPI extends Construct {

    public readonly httpApi: apigv2.HttpApi;

    constructor(scope: Construct, id: string, props: DocumentManagementAPIProps) {
        super(scope, id);
        const getDocumentsFunction = new lambda.NodejsFunction(this, 'getDocumentsFunction', {
            runtime: awslambda.Runtime.NODEJS_14_X,
            entry: path.join(__dirname, '..', 'api', 'getDocuments', 'index.ts'),
            handler: 'getDocuments',
            bundling: {
                externalModules: ['aws-sdk']
            },
            environment: {
                DOCUMENTS_BUCKET_NAME: props.documentBucket.bucketName
            },
        })
        const bucketPermissions = new iam.PolicyStatement();
        bucketPermissions.addResources(`${props.documentBucket.bucketArn}/*`);
        bucketPermissions.addActions('s3:GetObject', 's3:PutObject');
        getDocumentsFunction.addToRolePolicy(bucketPermissions);

        const bucketContainerPermissions = new iam.PolicyStatement();
        bucketContainerPermissions.addResources(props.documentBucket.bucketArn);
        bucketContainerPermissions.addActions('s3:ListBucket');
        getDocumentsFunction.addToRolePolicy(bucketContainerPermissions);
        
        this.httpApi = new apigv2.HttpApi(this, 'HttpAPI', {
            apiName: 'document-management-api',
            createDefaultStage: true,
            corsPreflight: {
                allowMethods: [apigv2.CorsHttpMethod.GET],
                allowOrigins: ['*'],
                maxAge: duration.days(10)
            }
        });

        const docsIntegration = new integration.HttpLambdaIntegration('documentIntegration', getDocumentsFunction);

        this.httpApi.addRoutes({
            path: '/getDocument',
            methods: [
                apigv2.HttpMethod.GET
            ],
            integration: docsIntegration
        })

        new CfnOutput(this, 'APIEndpoint', {
            value: this.httpApi.url!,
            exportName: 'APIEndpoint'
        })
    }
}