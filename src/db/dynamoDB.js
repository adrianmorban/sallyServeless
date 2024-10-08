import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
// import dotenv from 'dotenv';

// dotenv.config();

// let accessKeyId = process.env.ACCESS_KEY_ID || '';
// let secretAccessKey = process.env.SECRET_ACCESS_KEY || '';

const client = new DynamoDBClient({ 
    region: "us-east-1",
    // credentials: {
    //     accessKeyId: accessKeyId,
    //     secretAccessKey: secretAccessKey,
    // }
});

const ddbDocClient = DynamoDBDocumentClient.from(client);

const retrieveSession = async (sessionID) => {
    sessionID = sessionID.toString();
    const command = new GetCommand({
        TableName: "sallySessions",
        Key: {
            sessionID: sessionID,
        }
    });
    const response = await ddbDocClient.send(command);
    return response.Item;
}

const updateSession = async (from, messages, chatID) => {
    const {id, first_name, last_name, language_code} = from;
    const command = new PutCommand({
        TableName: "sallySessions",
        Item: {
            sessionID: id.toString(),
            chatID: chatID,
            first_name: first_name,
            last_name: last_name,
            language_code: language_code,
            messages: messages,
            TTL: Math.floor(Date.now() / 1000) + 3600,
        },
        removeUndefinedValues: true,
        removeNullValues: true,
    });
    const response = await ddbDocClient.send(command);
    return response;
}

const setAppointment = async (day, hour, fullName, dni) => {
    const command = new PutCommand({
        TableName: "sallyAppointments",
        Item: {
            appointmentID: Date.now().toString(),
            day: day,
            hour: hour,
            fullName: fullName,
            dni: dni,
        },
        removeUndefinedValues: true,
        removeNullValues: true,
    });
    const response = await ddbDocClient.send(command);
    return response;
}

export { retrieveSession, updateSession, setAppointment };