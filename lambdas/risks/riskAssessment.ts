import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';

const dynamoDb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.RISKS_TABLE_NAME as string;

export const handler: APIGatewayProxyHandler = async (event) => {
  const { riskId } = JSON.parse(event.body || '{}');
  
  const params = {
    TableName: TABLE_NAME,
    Key: { riskId },
  };

  const result = await dynamoDb.get(params).promise();

  if (!result.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Risk not found' }),
    };
  }

  // Here, you can implement your logic for risk assessment
  const riskScore = calculateRiskScore(result.Item); // Implement your own scoring logic

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
    },
    body: JSON.stringify({ riskId: result.Item.riskId, riskScore }),
  };
};

const calculateRiskScore = (risk: any): number => {
  // Implement scoring logic based on risk attributes
  const impactWeight = risk.impact === 'High' ? 3 : risk.impact === 'Medium' ? 2 : 1;
  const likelihoodWeight = risk.likelihood === 'Almost Certain' ? 5 : risk.likelihood === 'Likely' ? 4 : 3;
  
  return impactWeight * likelihoodWeight; // Simple scoring logic
};
