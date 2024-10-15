import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';

const dynamoDb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.ASSESSMENTS_TABLE_NAME as string;

export const handler: APIGatewayProxyHandler = async () => {
  const result = await dynamoDb.scan({ TableName: TABLE_NAME }).promise();
  const items = result.Items || [];
  const totalAssessments = items.length;
  const totalScore = items.reduce((sum, assessment) => sum + (assessment.score || 0), 0);
  const averageScore = totalAssessments > 0 ? totalScore / totalAssessments : 0;

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'OPTIONS, GET',
    },
    body: JSON.stringify({ totalAssessments, averageScore, assessments: result.Items }),
  };
};
