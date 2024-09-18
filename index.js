import messageController from "./src/controllers/messageController.js";

const handler = async (event) => {
    const {message} = event;
    const {from, text} = message;
    const response = await messageController.getMessage(from, text);
    return response;
}

export default handler;