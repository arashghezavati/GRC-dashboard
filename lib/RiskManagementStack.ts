import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

export class RiskManagementStack extends Stack {
  constructor(scope: cdk.App, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create DynamoDB table for risks
    const risksTable = new dynamodb.Table(this, 'RisksTable', {
      partitionKey: { name: 'riskId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Change for production
    });

    // Create Lambda function for creating a risk
    const createRiskLambda = new lambda.Function(this, 'CreateRiskLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'createRisk.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambdas/risks')),
      environment: {
        RISKS_TABLE_NAME: risksTable.tableName,
      },
    });

    // Create Lambda function for getting all risks
    const getRisksLambda = new lambda.Function(this, 'GetRisksLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'getRisks.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambdas/risks')),
      environment: {
        RISKS_TABLE_NAME: risksTable.tableName,
      },
    });

    // Create Lambda function for getting a specific risk
    const getRiskLambda = new lambda.Function(this, 'GetRiskLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'getRisk.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambdas/risks')),
      environment: {
        RISKS_TABLE_NAME: risksTable.tableName,
      },
    });

    // Create Lambda function for deleting a risk
    const deleteRiskLambda = new lambda.Function(this, 'DeleteRiskLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'deleteRisk.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambdas/risks')),
      environment: {
        RISKS_TABLE_NAME: risksTable.tableName,
      },
    });

    // Create Lambda function for risk assessment
    const riskAssessmentLambda = new lambda.Function(this, 'RiskAssessmentLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'riskAssessment.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambdas/risks')),
      environment: {
        RISKS_TABLE_NAME: risksTable.tableName,
      },
    });

    // Create Lambda function for getting risk types
    const getRiskTypesLambda = new lambda.Function(this, 'GetRiskTypesLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'getRiskTypes.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambdas/risks')),
    });

    // Grant permissions to Lambda functions to interact with DynamoDB
    risksTable.grantReadWriteData(createRiskLambda);
    risksTable.grantReadData(getRisksLambda);
    risksTable.grantReadData(getRiskLambda);
    risksTable.grantReadData(deleteRiskLambda);
    risksTable.grantReadData(riskAssessmentLambda);

    // Create API Gateway for risks
    const api = new apigateway.RestApi(this, 'RiskApi', {
      restApiName: 'Risk Management Service',
      defaultCorsPreflightOptions: {
        allowOrigins: ['http://localhost:3000'], // Adjust as needed
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });
  

    // Define API resources and methods
    const risksResource = api.root.addResource('risks');
    risksResource.addMethod('POST', new apigateway.LambdaIntegration(createRiskLambda)); // Create risk
    risksResource.addMethod('GET', new apigateway.LambdaIntegration(getRisksLambda)); // Get all risks

    const riskResource = risksResource.addResource('{riskId}');
    riskResource.addMethod('GET', new apigateway.LambdaIntegration(getRiskLambda)); // Get specific risk
    riskResource.addMethod('DELETE', new apigateway.LambdaIntegration(deleteRiskLambda)); // Delete risk

    // Create a new resource for risk types
    const riskTypesResource = api.root.addResource('risk-types');
    riskTypesResource.addMethod('GET', new apigateway.LambdaIntegration(getRiskTypesLambda)); // Get risk types

    const assessmentResource = api.root.addResource('risk-assessment');
    assessmentResource.addMethod('POST', new apigateway.LambdaIntegration(riskAssessmentLambda)); // Risk assessment
  }
}
