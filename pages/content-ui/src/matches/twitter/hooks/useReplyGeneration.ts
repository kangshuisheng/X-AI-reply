import { showErrorMessage, showSuccessMessage } from '../utils/notifications';
import { useState } from 'react';

export const useReplyGeneration = () => {
  const [replies, setReplies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateReplies = async (tweetContent: string, toneId: string) => {
    setLoading(true);
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GENERATE_REPLY',
        payload: { tweetContent, toneId },
      });

      if (response.success) {
        setReplies(response.replies);
      } else {
        showErrorMessage(response.error || '生成回复失败');
        setReplies([]);
      }
    } catch (error) {
      console.error('Failed to generate replies:', error);
      showErrorMessage('网络连接失败，请检查网络连接');
      setReplies([]);
    } finally {
      setLoading(false);
    }
  };

  const insertReply = (reply: string) => {
    const replyBox = document.querySelector('[data-testid="tweetTextarea_0"]') as HTMLElement;
    if (replyBox) {
      replyBox.focus();
      document.execCommand('insertText', false, reply);
      showSuccessMessage('回复已填充成功！');
    }
  };

  return { replies, loading, generateReplies, insertReply, setReplies };
};
