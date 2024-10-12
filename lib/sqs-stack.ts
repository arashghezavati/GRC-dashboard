import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as path from 'path';

export class SqsStack extends Stack {
    public readonly meetingTasksQueue: sqs.Queue;

    constructor(scope: cdk.App, id: string, props?: StackProps) {
        super(scope, id, props);

        // Create the SQS queue
        this.meetingTasksQueue = new sqs.Queue(this, 'MeetingTasksQueue', {
            visibilityTimeout: cdk.Duration.seconds(300),
            retentionPeriod: cdk.Duration.days(4),
        });

        // Create an SNS topic for email notifications
        const emailTopic = new sns.Topic(this, 'EmailTopic', {
            displayName: 'Meeting Notifications',
        });

        // Subscribe email address to the SNS topic
        emailTopic.addSubscription(new snsSubscriptions.EmailSubscription('arash.ghezavati@gmail.com'));

        // Define the NotificationProcessor Lambda function
        const notificationProcessorLambda = new lambda.Function(this, 'NotificationProcessor', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'notificationProcessor.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambdas/notifications')),
            environment: {
                EMAIL_TOPIC_ARN: emailTopic.topicArn,
            },
        });

        // Grant permissions to publish to SNS
        emailTopic.grantPublish(notificationProcessorLambda);

        // Add the SQS queue as an event source for the Lambda function
        notificationProcessorLambda.addEventSource(new lambdaEventSources.SqsEventSource(this.meetingTasksQueue, {
            batchSize: 10,
        }));

        // Output the queue URL for reference
        new cdk.CfnOutput(this, 'QueueUrl', {
            value: this.meetingTasksQueue.queueUrl,
        });
    }
}
