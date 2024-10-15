import { S3 } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';

const s3 = new S3();
const BUCKET_NAME = process.env.BUCKET_NAME as string;

export const handler: APIGatewayProxyHandler = async (event) => {
  const { fileName } = JSON.parse(event.body || '{}');
  const s3Params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Expires: 60,
    ContentType: 'application/pdf',
  };

  const url = s3.getSignedUrl('putObject', s3Params);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'OPTIONS, POST',
    },
    body: JSON.stringify({ url }),
  };
};
