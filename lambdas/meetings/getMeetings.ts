import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.MEETING_TABLE_NAME || '';

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const result = await dynamoDb.scan({ TableName: TABLE_NAME }).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching meetings', error }),
    };
  }
};
