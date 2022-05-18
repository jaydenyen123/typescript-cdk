import { aws_lambda_nodejs as lambda, aws_lambda as awslambda } from "aws-cdk-lib";
import { Construct } from 'constructs';
interface DocumentManagementAPIProps {
}

export class DocumentManagementAPI extends Construct {
    constructor(scope: Construct, id: string, props?: DocumentManagementAPIProps) {
        super(scope, id);
        const getDocumentsFunction = new lambda.NodejsFunction(this, 'getDocumentsFunction', {
            runtime: awslambda.Runtime.NODEJS_14_X,
            entry: 'api/getDocuments/index.ts',
            handler: 'getDocuments',
            bundling: {
                externalModules: ['aws-sdk']
            }
        })
    }
}