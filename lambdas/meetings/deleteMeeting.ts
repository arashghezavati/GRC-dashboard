// deleteMeeting.js
import * as AWS from 'aws-sdk';


import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const meetingId = event.pathParameters?.meetingId; // Get meetingId from the path
    if (!meetingId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Meeting ID is required' }),
        };
    }
    const tableName = process.env.MEETING_TABLE_NAME;
    if (!tableName) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Table name is not defined in environment variables' }),
        };
    }

    const params = {
        TableName: tableName,
        Key: { meetingId },
    };

    try {
        await dynamoDb.delete(params).promise();
        return {
            statusCode: 204, // No content
            body: JSON.stringify({}), // Empty body
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error deleting meeting', error }),
        };
    }
};
