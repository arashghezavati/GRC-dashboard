import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';

const dynamoDb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.RISKS_TABLE_NAME as string;

export const handler: APIGatewayProxyHandler = async (event) => {
  const { riskId } = event.pathParameters || {};

  const params = {
    TableName: TABLE_NAME,
    Key: { riskId },
  };

  await dynamoDb.delete(params).promise();

  return {
    statusCode: 204, // No content
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:3000', // Change this to your frontend's origin
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'OPTIONS, GET, POST, DELETE',
    },
    
    body: JSON.stringify({}),
  };
};
