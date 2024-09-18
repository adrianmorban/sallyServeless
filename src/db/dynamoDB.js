import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import dotenv from 'dotenv';

dotenv.config();

let accessKeyId = process.env.ACCESS_KEY_ID || '';
let secretAccessKey = process.env.SECRET_ACCESS_KEY || '';

const client = new DynamoDBClient({ 
    region: "us-east-1",
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
    }
});

const ddbDocClient = DynamoDBDocumentClient.from(client);

const retrieveSession = async (sessionID) => {
    const command = new GetCommand({
        TableName: "sallySessions",
        Key: {
            sessionID,
        }
    });
    const response = await ddbDocClient.send(command);
    return response.Item;
}

const updateSession = async (from, messages) => {
    const {id, first_name, last_name, language_code} = from;
    const command = new PutCommand({
        TableName: "sallySessions",
        Item: {
            sessionID: id,
            first_name: first_name,
            last_name: last_name,
            language_code: language_code,
            messages: messages,
        },
    });
    const response = await ddbDocClient.send(command);
    return response;
}

export { retrieveSession, updateSession };