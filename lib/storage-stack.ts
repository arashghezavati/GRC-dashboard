import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class StorageStack extends Stack {
  constructor(scope: cdk.App, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create a DynamoDB table for meetings
    const meetingTable = new dynamodb.Table(this, 'MeetingTable', {
      partitionKey: { name: 'meetingId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,  // For development/testing only, change for production
    });

    // Output the table name for reference in other stacks
    new cdk.CfnOutput(this, 'MeetingTableName', {
      value: meetingTable.tableName,
    });
  }
}
