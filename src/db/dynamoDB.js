import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });
const ddbDocClient = DynamoDBDocumentClient.from(client);

const retrieveSession = async (sessionID) => {
    const command = new GetCommand({
        TableName: "sallySessions",
        Key: {
            sessionID: {
                S: sessionID,
            }
        },
    });
    const response = await ddbDocClient.send(command);
    return response.Item;
}

const updateSession = async (sessionID, messages) => {
    const command = new PutCommand({
        TableName: "sallySessions",
        Item: {
            sessionID,
            messages,
        },
    });
    const response = await ddbDocClient.send(command);
    return response;
}

export { retrieveSession, updateSession };