import { retrieveSession, updateSession} from '../db/dynamoDB.js';
import { openAICompletion } from '../services/openAIService.js';
import { sendMessage } from '../services/telegramService.js';

class MessageController {

    async getMessage(from, message, chat_id) {
        const {id} = from;
        try{
            const session = await retrieveSession(id);
            const messages = session ? session.messages : [];
            messages.push({role: 'user', content: message});
            const {completion, messagesResponse} = await openAICompletion(messages);
            await updateSession(from, messagesResponse);
            await sendMessage(id, completion, chat_id);
            return completion;
        }
        catch(e){
            await sendMessage(id, JSON.stringify(e), chat_id);
            // await sendMessage(id, 'Sorry, I am not able to process your request at the moment. Please try again later.', chat_id);
        }
    }
}

export default new MessageController();