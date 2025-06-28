
export const ttsService = {
  speak: (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported by this browser.'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      // Optional: configure voice, rate, pitch
      // const voices = window.speechSynthesis.getVoices();
      // utterance.voice = voices[0]; // Choose a specific voice
      utterance.lang = 'en-US';
      utterance.pitch = 1;
      utterance.rate = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      window.speechSynthesis.speak(utterance);
    });
  },

  stop: (): void => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  isSpeaking: (): boolean => {
    if ('speechSynthesis' in window) {
      return window.speechSynthesis.speaking;
    }
    return false;
  }
};
