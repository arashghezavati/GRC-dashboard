import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();
const TABLE_NAME = process.env.MEETING_TABLE_NAME || '';
const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL || '';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { meetingId, title, date, attendees, meetingType } = JSON.parse(event.body || '{}');

    if (!meetingId || !title || !date || !meetingType) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,DELETE',
        },
        body: JSON.stringify({ message: 'Missing required fields' }),
      };
    }

    const newMeeting = { meetingId, title, date, attendees: attendees || [], meetingType };

    await dynamoDb.put({ TableName: TABLE_NAME, Item: newMeeting }).promise();
    await sqs.sendMessage({ QueueUrl: SQS_QUEUE_URL, MessageBody: JSON.stringify(newMeeting) }).promise();

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,DELETE',
      },
      body: JSON.stringify(newMeeting),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,DELETE',
      },
      body: JSON.stringify({ message: 'Error creating meeting', error }),
    };
  }
};
