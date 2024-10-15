
// import { DynamoDB } from 'aws-sdk';
// import { APIGatewayProxyHandler } from 'aws-lambda';

// const dynamoDb = new DynamoDB.DocumentClient();
// const TABLE_NAME = process.env.RISKS_TABLE_NAME as string;

// export const handler: APIGatewayProxyHandler = async (event) => {
//   // Parse request body
//   const { title, description, impact, likelihood, mitigationStrategy, type } = JSON.parse(event.body || '{}');

//   // Define valid risk types
//   const validRiskTypes = ['Financial', 'Operational', 'Compliance', 'Reputational', 'Strategic'];

//   // Validate required fields and risk type
//   if (!title || !description || !impact || !likelihood || !mitigationStrategy || !type) {
//     return {
//       statusCode: 400,
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//         'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
//       },
//       body: JSON.stringify({ message: 'Missing required fields' }),
//     };
//   }

//   if (!validRiskTypes.includes(type)) {
//     return {
//       statusCode: 400,
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//         'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
//       },
//       body: JSON.stringify({ message: 'Invalid risk type' }),
//     };
//   }

//   // Create a new risk item
//   const newRisk = {
//     riskId: `risk-${Date.now()}`, // Generate a unique ID
//     title,
//     description,
//     impact,
//     likelihood,
//     mitigationStrategy,
//     type,
//     status: 'Open',
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   };

//   // Store the risk in DynamoDB
//   await dynamoDb.put({ TableName: TABLE_NAME, Item: newRisk }).promise();

//   return {
//     statusCode: 201,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//       'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
//     },
//     body: JSON.stringify(newRisk),
//   };
// };
import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';

const dynamoDb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.RISKS_TABLE_NAME as string;

export const handler: APIGatewayProxyHandler = async (event) => {
  const { title, description, impact, likelihood, mitigationStrategy, type } = JSON.parse(event.body || '{}');

  const validRiskTypes = ['Financial', 'Operational', 'Compliance', 'Reputational', 'Strategic'];

  // Validate required fields
  if (!title || !description || impact === undefined || likelihood === undefined || !mitigationStrategy || !type) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
      },
      body: JSON.stringify({ message: 'Missing required fields' }),
    };
  }

  if (!validRiskTypes.includes(type)) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
      },
      body: JSON.stringify({ message: 'Invalid risk type' }),
    };
  }

  // Create a new risk item
  const impactNum = Number(impact);
  const likelihoodNum = Number(likelihood);
  const riskScore = impactNum * likelihoodNum; // Calculate risk score
  const riskLevel = calculateRiskLevel(riskScore); // Determine risk level

  const newRisk = {
    riskId: `risk-${Date.now()}`,
    title,
    description,
    impact: impactNum, // Ensure it is a number
    likelihood: likelihoodNum, // Ensure it is a number
    mitigationStrategy,
    type,
    status: 'Open',
    riskLevel, // Add riskLevel to the item
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Store the risk in DynamoDB
  await dynamoDb.put({ TableName: TABLE_NAME, Item: newRisk }).promise();

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
    },
    body: JSON.stringify(newRisk),
  };
};

// Function to determine the risk level based on score
const calculateRiskLevel = (score: number): string => {
  if (score >= 15) return 'High';
  if (score >= 8) return 'Medium';
  return 'Low';
};
