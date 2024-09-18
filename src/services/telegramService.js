const botToken = process.env.BOT_TOKEN;

const sendMessage = async (chatID, message) => {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatID}&text=${message}`;
    const response = await fetch(url);
    return response.json();
}

export { sendMessage };