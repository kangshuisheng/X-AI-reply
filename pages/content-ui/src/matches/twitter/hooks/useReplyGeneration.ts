import { showErrorMessage, showSuccessMessage } from '../utils/notifications';
import { useState } from 'react';

export const useReplyGeneration = () => {
  const [replies, setReplies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateReplies = async (tweetContent: string, toneId: string) => {
    console.log('开始生成回复请求:', { tweetContent: tweetContent.substring(0, 100) + '...', toneId });
    setLoading(true);
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GENERATE_REPLY',
        payload: { tweetContent, toneId },
      });

      console.log('收到回复生成响应:', response);

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
      console.log('生成回复完成，设置loading为false');
      setLoading(false);
    }
  };

  const insertReply = (reply: string) => {
    const replyBox = document.querySelector('[data-testid="tweetTextarea_0"]') as HTMLElement;
    if (replyBox) {
      replyBox.focus();

      // Twitter的输入框通常是contentEditable的div
      if (replyBox.contentEditable === 'true' || replyBox.getAttribute('contenteditable') === 'true') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          const textNode = document.createTextNode(reply);
          range.insertNode(textNode);
          range.setStartAfter(textNode);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          // 如果没有选区，在末尾追加
          const currentText = replyBox.textContent || '';
          replyBox.textContent = currentText + reply;
        }

        // 触发输入事件
        replyBox.dispatchEvent(new Event('input', { bubbles: true }));
        replyBox.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (replyBox.tagName === 'TEXTAREA' || replyBox.tagName === 'INPUT') {
        // 备用方案：如果是标准输入框
        const textarea = replyBox as HTMLTextAreaElement | HTMLInputElement;
        const currentValue = textarea.value;
        const cursorPos = textarea.selectionStart || currentValue.length;
        textarea.value = currentValue.slice(0, cursorPos) + reply + currentValue.slice(cursorPos);
        textarea.selectionStart = textarea.selectionEnd = cursorPos + reply.length;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        // 最后的兜底方案：直接追加文本
        const currentText = replyBox.textContent || replyBox.innerText || '';
        replyBox.textContent = currentText + reply;
        replyBox.dispatchEvent(new Event('input', { bubbles: true }));
        replyBox.dispatchEvent(new Event('change', { bubbles: true }));
      }

      showSuccessMessage('回复已填充成功！');
    }
  };

  return { replies, loading, generateReplies, insertReply, setReplies };
};
