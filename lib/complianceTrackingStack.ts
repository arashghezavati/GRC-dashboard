import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class ComplianceTrackingStack extends Stack {
  constructor(scope: cdk.App, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create the S3 Bucket with CORS configuration 
    const bucket = new s3.Bucket(this, 'ComplianceTrackingDocuments', {
      bucketName: 'compliance-tracking-documents',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      cors: [
        {
          allowedOrigins: ['http://localhost:3000'], 
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag'],
          maxAge: 3000,
        },
      ],
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS, // Ensure ACLs are not blocked
      publicReadAccess: true, // Grant public read access to the bucket
    });
    

    // Create DynamoDB tables
    const standardsTable = new dynamodb.Table(this, 'ComplianceStandardsTable', {
      partitionKey: { name: 'standardId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const itemsTable = new dynamodb.Table(this, 'ComplianceItemsTable', {
      partitionKey: { name: 'itemId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const assessmentsTable = new dynamodb.Table(this, 'ComplianceAssessmentsTable', {
      partitionKey: { name: 'assessmentId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create Lambda functions
    const createStandardLambda = new lambda.Function(this, 'CreateComplianceStandardLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'createComplianceStandard.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambdas/compliance')),
      environment: {
        STANDARDS_TABLE_NAME: standardsTable.tableName,
      },
    });

    const getStandardsLambda = new lambda.Function(this, 'GetComplianceStandardsLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'getComplianceStandards.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambdas/compliance')),
      environment: {
        STANDARDS_TABLE_NAME: standardsTable.tableName,
      },
    });

    const createItemLambda = new lambda.Function(this, 'CreateComplianceItemLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'createComplianceItem.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambdas/compliance')),
      environment: {
        ITEMS_TABLE_NAME: itemsTable.tableName,
      },
    });

    const getItemsLambda = new lambda.Function(this, 'GetComplianceItemsLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'getComplianceItems.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambdas/compliance')),
      environment: {
        ITEMS_TABLE_NAME: itemsTable.tableName,
      },
    });

    const conductAssessmentLambda = new lambda.Function(this, 'ConductAssessmentLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'conductAssessment.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambdas/compliance')),
      environment: {
        ASSESSMENTS_TABLE_NAME: assessmentsTable.tableName,
      },
    });

    const getAssessmentsLambda = new lambda.Function(this, 'GetComplianceAssessmentsLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'getComplianceAssessments.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambdas/compliance')),
      environment: {
        ASSESSMENTS_TABLE_NAME: assessmentsTable.tableName,
      },
    });

    const generatePresignedUrlLambda = new lambda.Function(this, 'GeneratePresignedUrlLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'generatePresignedUrl.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambdas/compliance')),
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    });

    // Grant permissions to Lambda functions
    bucket.grantReadWrite(generatePresignedUrlLambda);
    standardsTable.grantReadWriteData(createStandardLambda);
    standardsTable.grantReadData(getStandardsLambda);
    itemsTable.grantReadWriteData(createItemLambda);
    itemsTable.grantReadData(getItemsLambda);
    assessmentsTable.grantReadWriteData(conductAssessmentLambda);
    assessmentsTable.grantReadData(getAssessmentsLambda);

    generatePresignedUrlLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['s3:PutObject', 's3:GetObject'],
        resources: [`${bucket.bucketArn}/*`],
      })
    );

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'ComplianceApi', {
      restApiName: 'Compliance Tracking Service',
      defaultCorsPreflightOptions: {
        allowOrigins: ['http://localhost:3000'], // Adjust as needed
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // Define API Gateway resources and methods
    const standardsResource = api.root.addResource('standards');
    standardsResource.addMethod('POST', new apigateway.LambdaIntegration(createStandardLambda));
    standardsResource.addMethod('GET', new apigateway.LambdaIntegration(getStandardsLambda));

    const itemsResource = api.root.addResource('items');
    itemsResource.addMethod('POST', new apigateway.LambdaIntegration(createItemLambda));
    itemsResource.addMethod('GET', new apigateway.LambdaIntegration(getItemsLambda));

    const assessmentsResource = api.root.addResource('assessments');
    assessmentsResource.addMethod('POST', new apigateway.LambdaIntegration(conductAssessmentLambda));
    assessmentsResource.addMethod('GET', new apigateway.LambdaIntegration(getAssessmentsLambda));

    const presignedUrlResource = api.root.addResource('presigned-url');
    presignedUrlResource.addMethod('POST', new apigateway.LambdaIntegration(generatePresignedUrlLambda));
  }
}
