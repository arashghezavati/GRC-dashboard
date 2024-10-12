import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';

export class MonitoringStack extends Stack {
  public readonly emailTopic: sns.Topic;

  constructor(scope: cdk.App, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create an SNS topic for email notifications
    this.emailTopic = new sns.Topic(this, 'EmailTopic', {
      displayName: 'Meeting Notifications',
    });

    // Output the topic ARN for reference
    new cdk.CfnOutput(this, 'EmailTopicArn', {
      value: this.emailTopic.topicArn,
    });
  }
}
