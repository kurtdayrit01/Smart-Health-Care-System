
import React, { useEffect, useState } from 'react';
import './PatientAI.css';
import { useLanguage } from './LanguageContext.jsx';

const API = 'http://localhost:4000/api';

export default function PatientAI() {
  const { language } = useLanguage();
  const isEnglish = language === 'English';

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const getWelcomeMessage = () =>
    isEnglish
      ? 'Hello! I am your SHMS Patient Assistant. I can help you understand appointments and how to use the patient portal. How can I help you today?'
      : 'Kumusta! Ako ang SHMS Patient Assistant. Matutulungan kitang maintindihan ang mga appointment at paggamit ng patient portal. Paano kita matutulungan ngayon?';

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: getWelcomeMessage()
    }
  ]);

  // Update the welcome message when language changes,
  // but preserve the conversation if there are other messages.
  useEffect(() => {
    setMessages(previous => {
      if (
        previous.length === 1 &&
        previous[0].role === 'assistant'
      ) {
        return [{
          role: 'assistant',
          content: getWelcomeMessage()
        }];
      }

      return previous;
    });
  }, [language]);

  async function sendMessage(event) {
    event?.preventDefault();

    const text = message.trim();

    if (!text || loading) return;

    const token = sessionStorage.getItem('token');

    if (!token) {
      setMessages(previous => [
        ...previous,
        {
          role: 'assistant',
          content: isEnglish
            ? 'Your session has expired. Please log in again.'
            : 'Nag-expire na ang session mo. Mag-log in ulit.'
        }
      ]);
      return;
    }

    const updatedMessages = [
      ...messages,
      { role: 'user', content: text }
    ];

    setMessages(updatedMessages);
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: text,
          language,
          history: updatedMessages
            .slice(-7, -1)
            .map(item => ({
              role: item.role,
              content: item.content
            }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          (isEnglish
            ? 'Unable to contact AI assistant.'
            : 'Hindi makakonekta sa AI Assistant.')
        );
      }

      setMessages(previous => [
        ...previous,
        {
          role: 'assistant',
          content: data.reply ||
            (isEnglish
              ? 'No response received.'
              : 'Walang natanggap na sagot.')
        }
      ]);

    } catch (error) {
      setMessages(previous => [
        ...previous,
        {
          role: 'assistant',
          content: error.message ||
            (isEnglish
              ? 'AI assistant is unavailable.'
              : 'Hindi available ang AI Assistant sa ngayon.')
        }
      ]);

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="patient-ai-widget">

      {isOpen && (
        <section className="patient-ai-window">

          <header className="patient-ai-header">
            <div>
              <strong>SHMS Patient Assistant</strong>
              <small>
                {isEnglish
                  ? 'Local AI Assistant'
                  : 'Lokal na AI Assistant'}
              </small>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={isEnglish ? 'Close chat' : 'Isara ang chat'}
            >
              ×
            </button>
          </header>

          <div className="patient-ai-messages">
            {messages.map((item, index) => (
              <div
                key={index}
                className={`patient-ai-message ${item.role}`}
              >
                {item.content}
              </div>
            ))}

            {loading && (
              <div className="patient-ai-message assistant">
                {isEnglish ? 'Thinking...' : 'Nag-iisip...'}
              </div>
            )}
          </div>

          <form
            className="patient-ai-input-area"
            onSubmit={sendMessage}
          >
            <input
              type="text"
              value={message}
              onChange={event => setMessage(event.target.value)}
              placeholder={
                isEnglish
                  ? 'Ask something...'
                  : 'Magtanong dito...'
              }
              maxLength={2000}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !message.trim()}
            >
              {isEnglish ? 'Send' : 'Ipadala'}
            </button>
          </form>

          <p className="patient-ai-disclaimer">
            {isEnglish
              ? 'General information only. For medical concerns, consult a qualified doctor.'
              : 'Pangkalahatang impormasyon lamang ito. Para sa mga alalahaning medikal, kumonsulta sa kwalipikadong doktor.'}
          </p>

        </section>
      )}

      <button
        type="button"
        className="patient-ai-toggle"
        onClick={() => setIsOpen(previous => !previous)}
        aria-label={
          isOpen
            ? (isEnglish ? 'Close assistant' : 'Isara ang assistant')
            : (isEnglish ? 'Open patient assistant' : 'Buksan ang assistant')
        }
      >
        {isOpen ? '×' : '💬'}
      </button>

    </div>
  );
}
