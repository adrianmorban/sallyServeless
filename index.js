import messageController from "./src/controllers/messageController.js";

const handler = async (event) => {
    const {message} = event;
    const {from, text, chat} = message;
    const response = await messageController.getMessage(from, text, chat.id);
    return response;
}

export default handler;