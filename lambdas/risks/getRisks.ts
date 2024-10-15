
import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';

const dynamoDb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.RISKS_TABLE_NAME as string;

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const result = await dynamoDb.scan({ TableName: TABLE_NAME }).promise();
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
      },
      body: JSON.stringify({
        count: (result.Items ?? []).length,
        risks: result.Items,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
      },
      body: JSON.stringify({ message: 'Error fetching risks', error }),
    };
  }
};
