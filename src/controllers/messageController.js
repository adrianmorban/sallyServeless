import { retrieveSession, updateSession} from '../db/dynamoDB.js';
import { openAICompletion } from '../services/openAIService.js';

class MessageController {

    async getMessage(userID, message) {
        const session = await retrieveSession(userID);
        const messages = session ? session.messages : [];
        messages.push({role: 'user', content: message});
        const completion = await openAICompletion(messages);
        messages.push({role: 'system', content: completion});
        console.log(await updateSession(userID, messages));
        res.send(completion);
    }
}

export default new MessageController();