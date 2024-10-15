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

  const result = await dynamoDb.get(params).promise();

  if (!result.Item) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
      },
      body: JSON.stringify({ message: 'Risk not found' }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
    },
    body: JSON.stringify(result.Item),
  };
};
