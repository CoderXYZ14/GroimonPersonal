export default async function sendDirectMessage(
  recipientId: string,
  message: string,
  accessToken: string
) {
  const url = `https://graph.instagram.com/v21.0/me/messages`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
  const body = {
    recipient: {
      id: recipientId,
    },
    message: {
      text: message,
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Message Sent:", JSON.stringify(data, null, 4));
    return data;
  } catch (error) {
    console.error("Error sending direct message:", error);
    return null;
  }
}
