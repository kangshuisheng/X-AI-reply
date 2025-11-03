import { domCache } from '../utils/domCache';
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
      console.error('生成回复失败:', error);
      showErrorMessage('网络连接失败，请检查网络连接');
      setReplies([]);
    } finally {
      setLoading(false);
    }
  };

  const insertReply = (reply: string) => {
    const replyBox = domCache.getReplyBox();
    if (replyBox) {
      replyBox.focus();

      // 使用粘贴事件的形式插入文本，更自然更符合用户输入行为
      const dataTransfer = new DataTransfer();
      dataTransfer.setData('text/plain', reply);

      const pasteEvent = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: dataTransfer,
      });

      replyBox.dispatchEvent(pasteEvent);

      showSuccessMessage('回复已填充成功！');
    }
  };

  return { replies, loading, generateReplies, insertReply, setReplies };
};
