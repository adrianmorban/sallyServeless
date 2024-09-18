import { retrieveSession, updateSession} from '../db/dynamoDB.js';
import { openAICompletion } from '../services/openAIService.js';

class MessageController {

    async getMessage(from, message) {
        const {userID} = from;
        const session = await retrieveSession(userID);
        const messages = session ? session.messages : [];
        messages.push({role: 'user', content: message});
        const completion = await openAICompletion(messages);
        messages.push({role: 'system', content: completion});
        await updateSession(from, messages);
        return completion;
    }
}

export default new MessageController();