export const getTweetContent = (): string => {
  const mainTweet = document.querySelector('[data-testid="tweetText"]')?.textContent || '';
  const quotedTweet = document.querySelector('[data-testid="quotedTweet"]');
  const quotedText = quotedTweet?.querySelector('[data-testid="tweetText"]')?.textContent || '';

  const replyChain = Array.from(document.querySelectorAll('[data-testid="tweet"]'))
    .map(tweet => {
      const tweetText = tweet.querySelector('[data-testid="tweetText"]')?.textContent;
      const author = tweet.querySelector('[data-testid="User-Name"]')?.textContent;
      return tweetText && author ? `${author}: ${tweetText}` : null;
    })
    .filter(Boolean)
    .slice(0, 5);

  let content = '';
  if (replyChain.length > 1) {
    content = `对话上下文:\n${replyChain.join('\n')}\n\n当前回复: ${mainTweet}`;
  } else {
    content = mainTweet;
  }

  if (quotedText) {
    content += `\n\n引用: ${quotedText}`;
  }

  return content;
};
