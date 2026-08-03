const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export type DoctorCategory = 'physicians' | 'dentists' | 'physiotherapy';

export type Citation = {
  id: string;
  title: string;
  author: string;
  journal: string;
  year: string;
  url: string;
};

export const aiService = {
  /**
   * Sends a text message to the AI backend and returns the structured reply
   * routed to the specific doctor category resources.
   */
  async sendMessageByText(
    message: string,
    mode: 'general' | 'fast_recap' = 'general',
    category: DoctorCategory = 'physicians',
  ): Promise<{ reply: string; citations?: Citation[] }> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, mode, category }),
      });

      if (!response.ok) {
        console.error('Chat API error:', response.status);
        return { reply: "I'm sorry, I'm having trouble connecting to the medical AI server right now. Please try again." };
      }

      const data = await response.json();
      return { 
        reply: data.reply || "I'm sorry, I received an empty response. Please try again.",
        citations: data.citations
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return { reply: "I'm sorry, I can't reach the medical AI server right now. Make sure the backend server is running." };
    }
  },

  async processAudio(
    base64Audio: string,
    mimeType: string = 'audio/m4a',
  ): Promise<{ text: string; reply: string }> {
    return {
      text: '(Audio processing unavailable)',
      reply:
        'Voice input is not supported in this version. Please type your clinical query.',
    };
  },
};
