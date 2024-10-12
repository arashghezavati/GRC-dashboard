import { SQSEvent, SQSHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const sns = new AWS.SNS();
const EMAIL_TOPIC_ARN = process.env.EMAIL_TOPIC_ARN || '';

export const handler: SQSHandler = async (event: SQSEvent) => {
  try {
    // Loop through all records in the SQS event
    for (const record of event.Records) {
      // Parse the message body
      const messageBody = JSON.parse(record.body);
      const { meetingId, title, date, attendees } = messageBody;

      // Format the notification message
      const subject = `Invitation to ${title}`;
      const message = `You are invited to the meeting '${title}' scheduled on ${date}.`;

      // Send notifications to each attendee
      for (const attendee of attendees) {
        await sns.publish({
          Subject: subject,
          Message: message,
          TopicArn: EMAIL_TOPIC_ARN,
        }).promise();
      }
    }

    console.log('All notifications processed successfully');
  } catch (error) {
    console.error('Error processing notifications', error);
    throw new Error('Notification processing failed');
  }
};
