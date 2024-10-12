import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions';


export class ApiStack extends Stack {
    constructor(scope: cdk.App, id: string, props?: StackProps) {
        super(scope, id, props);

        // Import the DynamoDB table created in StorageStack
        const meetingTable = dynamodb.Table.fromTableName(this, 'ImportedMeetingTable', 'StorageStack-MeetingTable9A1C981D-1LQDBUF7VUV76');

        // Define Lambda for creating a meeting
        const createMeetingLambda = new lambda.Function(this, 'CreateMeetingLambda', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'createMeeting.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambdas/meetings')),
            environment: {
                MEETING_TABLE_NAME: 'StorageStack-MeetingTable9A1C981D-1LQDBUF7VUV76',
                SQS_QUEUE_URL: 'https://sqs.us-east-1.amazonaws.com/975049911030/SqsStack-MeetingTasksQueue34AA4ED6-ic8aDhQVyJWg',
            },
        });

        // Define Lambda for getting meetings
        const getMeetingsLambda = new lambda.Function(this, 'GetMeetingsLambda', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'getMeetings.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambdas/meetings')),
            environment: {
                MEETING_TABLE_NAME: 'StorageStack-MeetingTable9A1C981D-1LQDBUF7VUV76',
            },
        });
        const deleteMeetingLambda = new lambda.Function(this, 'DeleteMeetingLambda', {
          runtime: lambda.Runtime.NODEJS_16_X,
          handler: 'deleteMeeting.handler',
          code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambdas/meetings')),
          environment: {
              MEETING_TABLE_NAME: 'StorageStack-MeetingTable9A1C981D-1LQDBUF7VUV76',
          },
      });
      

        // Grant permissions to the Lambda functions to interact with the DynamoDB table
        meetingTable.grantReadWriteData(createMeetingLambda);
        meetingTable.grantReadData(getMeetingsLambda);
        meetingTable.grantReadData(deleteMeetingLambda);

        // API Gateway setup
        const api = new apigateway.RestApi(this, 'MeetingApi', {
            restApiName: 'Meeting Service',
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
                allowHeaders: ['Content-Type'],
            },
        });
         // Create an SNS Topic for alerts
         const alarmTopic = new sns.Topic(this, 'AlarmTopic', {
          displayName: 'Lambda Error Notifications',
      });
      

      // Subscribe an email to the SNS topic (replace with your email)
      alarmTopic.addSubscription(new subscriptions.EmailSubscription('ghezavatiarash@gmail.com'));
             // Create a CloudWatch Alarm for Lambda Errors
             const errorAlarm = new cloudwatch.Alarm(this, 'LambdaErrorAlarm', {
                metric: deleteMeetingLambda.metricErrors(), // Monitoring the error metric of the Lambda function

                threshold: 1, // Trigger the alarm if the error count is 1 or more
                evaluationPeriods: 1, // Check the error count in a single period
                treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING, // Treat missing data as not breaching
                alarmDescription: 'Alarm when the Lambda function has errors', // Description for the alarm
                actionsEnabled: true, // Enable actions (like notifications)
            });
          errorAlarm.addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));
          // errorAlarm.addAlarmAction(new cloudwatch.actions.SnsAction(alarmTopic));

       
// Create a CloudWatch Alarm for Get Meetings Lambda Errors
const getMeetingsErrorAlarm = new cloudwatch.Alarm(this, 'GetMeetingsErrorAlarm', {
    metric: getMeetingsLambda.metricErrors(),
    threshold: 1,
    evaluationPeriods: 1,
    treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    alarmDescription: 'Alarm when the Get Meetings Lambda function has errors',
    actionsEnabled: true,
});
getMeetingsErrorAlarm.addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));


// Create a CloudWatch Alarm for Create Meeting Lambda Errors
const createMeetingErrorAlarm = new cloudwatch.Alarm(this, 'CreateMeetingErrorAlarm', {
    metric: createMeetingLambda.metricErrors(),
    threshold: 1,
    evaluationPeriods: 1,
    treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    alarmDescription: 'Alarm when the Create Meeting Lambda function has errors',
    actionsEnabled: true,
});
createMeetingErrorAlarm.addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));

        // Meetings resource without authentication
        const meetingsResource = api.root.addResource('meetings');
        meetingsResource.addMethod('POST', new apigateway.LambdaIntegration(createMeetingLambda));
        meetingsResource.addMethod('GET', new apigateway.LambdaIntegration(getMeetingsLambda));

        const meetingResource = meetingsResource.addResource('{meetingId}'); // Path parameter for meetingId
        meetingResource.addMethod('DELETE', new apigateway.LambdaIntegration(deleteMeetingLambda)); // Delete meeting




    }
}
