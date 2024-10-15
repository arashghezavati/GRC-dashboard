import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async () => {
  const riskTypes = [
    { id: 1, name: 'Financial' },
    { id: 2, name: 'Operational' },
    { id: 3, name: 'Compliance' },
    { id: 4, name: 'Reputational' },
    { id: 5, name: 'Strategic' },
  ];

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
    },
    body: JSON.stringify(riskTypes),
  };
};
