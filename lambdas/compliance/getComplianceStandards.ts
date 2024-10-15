import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';

const dynamoDb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.STANDARDS_TABLE_NAME as string;

export const handler: APIGatewayProxyHandler = async () => {
  const result = await dynamoDb.scan({ TableName: TABLE_NAME }).promise();
  const totalStandards = result.Items ? result.Items.length : 0;

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'OPTIONS, GET',
    },
    body: JSON.stringify({ totalStandards, standards: result.Items }),
  };
};