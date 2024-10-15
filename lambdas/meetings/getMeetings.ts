import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.MEETING_TABLE_NAME || '';

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const result = await dynamoDb.scan({ TableName: TABLE_NAME }).promise();

    const totalMeetings = (result.Items ?? []).length;
    const currentDate = new Date().toISOString();
    const upcomingMeetings = (result.Items ?? []).filter(meeting => meeting.date > currentDate).length;
    const pastMeetings = (result.Items ?? []).filter(meeting => meeting.date < currentDate).length;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,DELETE',
      },
      body: JSON.stringify({
        totalMeetings,
        upcomingMeetings,
        pastMeetings,
        meetings: result.Items || [],
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,DELETE',
      },
      body: JSON.stringify({ message: 'Error fetching meetings', error }),
    };
  }
};
