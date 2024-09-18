import messageController from "./src/controllers/messageController.js";

const handler = async (event) => {
    const {userID, message} = event;
    const response = await messageController.getMessage(userID, message);
    return response;
}

export default handler;