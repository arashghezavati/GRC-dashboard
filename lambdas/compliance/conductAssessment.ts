// import { DynamoDB } from 'aws-sdk';
// import { APIGatewayProxyHandler } from 'aws-lambda';

// const dynamoDb = new DynamoDB.DocumentClient();
// const TABLE_NAME = process.env.ASSESSMENTS_TABLE_NAME as string;

// export const handler: APIGatewayProxyHandler = async (event) => {
//   const { itemId, date, status, findings } = JSON.parse(event.body || '{}');
//   const assessmentId = `assessment-${Date.now()}`;

//   const newAssessment = { assessmentId, itemId, date, status, findings };

//   await dynamoDb.put({ TableName: TABLE_NAME, Item: newAssessment }).promise();

//   return {
//     statusCode: 201,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//       'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
//     },
//     body: JSON.stringify(newAssessment),
//   };
// };
import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';

const dynamoDb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.ASSESSMENTS_TABLE_NAME as string;

export const handler: APIGatewayProxyHandler = async (event) => {
  const { itemId, standardId, conductedBy, date, status, findings, pdfUrl } = JSON.parse(event.body || '{}');
  
  const assessmentId = `assessment-${Date.now()}`;

  const newAssessment = {
    assessmentId,
    itemId,         // The ID of the selected item
    standardId,     // The ID of the selected standard
    conductedBy,    // The person who conducted the assessment
    date,           // Date of the assessment
    status,         // Status of the assessment (Compliant, Non-compliant, Pending)
    findings,       // Findings from the assessment
    pdfUrl,         // URL of the uploaded PDF
  };

  await dynamoDb.put({ TableName: TABLE_NAME, Item: newAssessment }).promise();

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
    },
    body: JSON.stringify(newAssessment),
  };
};
