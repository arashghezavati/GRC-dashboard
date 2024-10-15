import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';

const dynamoDb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.ITEMS_TABLE_NAME as string;

export const handler: APIGatewayProxyHandler = async (event) => {
  const { name, description, standardId, pdfUrl } = JSON.parse(event.body || '{}');
  const itemId = `item-${Date.now()}`;

  const newItem = { itemId, name, description, standardId, pdfUrl };

  await dynamoDb.put({ TableName: TABLE_NAME, Item: newItem }).promise();

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
    },
    body: JSON.stringify(newItem),
  };
};
