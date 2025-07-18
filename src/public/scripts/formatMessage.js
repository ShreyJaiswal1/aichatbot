function formatMessage(text) {
  // Replace code blocks with language support (```language\ncode```)
  text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || 'plaintext';
    const highlightedCode = Prism.highlight(
      code.trim(),
      Prism.languages[language] || Prism.languages.plaintext,
      language
    );
    return `<pre class="line-numbers"><code class="language-${language}">${highlightedCode}</code></pre>`;
  });
  
  // Replace inline code (`code`)
  text = text.replace(/`([^`]+)`/g, (match, code) => {
    const highlightedCode = Prism.highlight(
      code,
      Prism.languages.plaintext,
      'plaintext'
    );
    return `<code class="language-plaintext">${highlightedCode}</code>`;
  });
  
  // Replace bold (**text**)
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Replace italic (*text*)
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Replace URLs
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  // Replace newlines with <br>
  text = text.replace(/\n/g, '<br>');
  
  return text;
}

