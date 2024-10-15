import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const meetingId = event.pathParameters?.meetingId;

  if (!meetingId) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,DELETE',
      },
      body: JSON.stringify({ message: 'Meeting ID is required' }),
    };
  }

  const tableName = process.env.MEETING_TABLE_NAME;

  if (!tableName) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,DELETE',
      },
      body: JSON.stringify({ message: 'Table name is not defined in environment variables' }),
    };
  }

  try {
    await dynamoDb.delete({ TableName: tableName, Key: { meetingId } }).promise();
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,DELETE',
      },
      body: JSON.stringify({}),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,DELETE',
      },
      body: JSON.stringify({ message: 'Error deleting meeting', error }),
    };
  }
};
