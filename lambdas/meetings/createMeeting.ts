import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();
const TABLE_NAME = process.env.MEETING_TABLE_NAME || '';
const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL || '';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { body } = event;
    const { meetingId, title, date, attendees } = JSON.parse(body || '{}');

    if (!meetingId || !title || !date) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' }),
      };
    }

    const newMeeting = {
      meetingId,
      title,
      date,
      attendees: attendees || [],
    };

    // Store the meeting in DynamoDB
    await dynamoDb
      .put({
        TableName: TABLE_NAME,
        Item: newMeeting,
      })
      .promise();

    // Push a message to the SQS queue
    await sqs.sendMessage({
      QueueUrl: SQS_QUEUE_URL,
      MessageBody: JSON.stringify(newMeeting),
    }).promise();

    return {
      statusCode: 201,
      body: JSON.stringify(newMeeting),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error creating meeting', error }),
    };
  }
};
