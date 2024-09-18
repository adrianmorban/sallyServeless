import messageController from "./src/controllers/messageController";

export default handler = async (event) => {
    const {userID, message} = event.body;
    const response = await messageController.getMessage(userID, message);
    return response;
}