import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ChatBot() {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hello! 👋 I\'m your Pharmacy Assistant. I can help you with:\n\n• Medicine information\n• Stock management\n• Billing queries\n• Customer support\n• General pharmacy questions\n\nHow can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickResponses = [
    { question: 'How to add medicine?', answer: 'To add a new medicine:\n\n1. Go to the Stock tab\n2. Click "Add Medicine" button\n3. Fill in the details (name, category, price, quantity, expiry date)\n4. Click "Add Medicine" to save\n\nThe medicine will appear in your stock list immediately!' },
    { question: 'How to create a bill?', answer: 'To create a bill:\n\n1. Go to the Billing tab\n2. Click "Add New Bill"\n3. Enter customer details\n4. Add medicines to the bill\n5. Review GST and totals\n6. Click "Create Bill"\n\nYou can also print the bill after creation!' },
    { question: 'How to manage customers?', answer: 'To manage customers:\n\n1. Go to the Customers tab\n2. Click "Add Customer" to add new\n3. Use the search bar to find existing customers\n4. Click Edit or Delete icons to manage\n\nCustomer information is stored securely!' },
    { question: 'What is demand prediction?', answer: 'Demand Prediction uses AI to forecast medicine needs:\n\n• Analyzes past 7 days of sales\n• Predicts future demand\n• Identifies stock shortages\n• Suggests reorder quantities\n\nVisit the Predictions tab to see forecasts!' },
    { question: 'How to check stock status?', answer: 'To check stock status:\n\n1. Go to the Stock tab\n2. Use search or category filter\n3. Check the Status column:\n   - 🟢 In Stock\n   - 🟡 Expiring Soon\n   - 🟠 Low Stock\n   - 🔴 Expired\n\nYou can edit stock levels anytime!' },
    { question: 'How to print a bill?', answer: 'To print a bill:\n\n1. Go to Billing tab\n2. Click the 👁️ (eye) icon on any bill\n3. Review the bill details\n4. Click "Print Bill" button\n\nThe bill will open in a printable format!' }
  ];

  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    // Check quick responses
    const quickMatch = quickResponses.find(qr => 
      lowerMessage.includes(qr.question.toLowerCase().split(' ').slice(0, 2).join(' '))
    );
    
    if (quickMatch) {
      return quickMatch.answer;
    }

    // Medicine related
    if (lowerMessage.includes('medicine') || lowerMessage.includes('drug') || lowerMessage.includes('stock')) {
      return 'For medicine management:\n\n✅ Add medicines in the Stock tab\n✅ Track expiry dates\n✅ Monitor stock levels\n✅ Set reorder points\n✅ Filter by category\n\nNeed help with a specific medicine task?';
    }

    // Billing related
    if (lowerMessage.includes('bill') || lowerMessage.includes('invoice') || lowerMessage.includes('payment')) {
      return 'For billing:\n\n💳 Create bills in the Billing tab\n💳 Add customer GST details\n💳 Multiple payment modes (Cash/Card/UPI)\n💳 Print professional invoices\n💳 Edit or delete bills\n\nWant to know more about a specific billing feature?';
    }

    // Customer related
    if (lowerMessage.includes('customer') || lowerMessage.includes('client')) {
      return 'For customer management:\n\n👥 Add customers in the Customers tab\n👥 Store contact information\n👥 Track customer history\n👥 Search and filter customers\n👥 Update customer details anytime\n\nNeed help with customer management?';
    }

    // Prediction related
    if (lowerMessage.includes('predict') || lowerMessage.includes('forecast') || lowerMessage.includes('ai')) {
      return 'Our AI Prediction feature:\n\n🤖 Analyzes sales patterns\n🤖 Forecasts demand for 7 days\n🤖 Identifies reorder needs\n🤖 Prevents stock-outs\n🤖 Optimizes inventory\n\nCheck the Predictions tab for insights!';
    }

    // Dashboard related
    if (lowerMessage.includes('dashboard') || lowerMessage.includes('overview') || lowerMessage.includes('stats')) {
      return 'The Dashboard shows:\n\n📊 Total revenue\n📊 Recent sales\n📊 Low stock alerts\n📊 Expiring medicines\n📊 Monthly trends\n📊 Quick actions\n\nVisit the Dashboard for a complete overview!';
    }

    // Help or greeting
    if (lowerMessage.includes('help') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'I\'m here to help! You can ask me about:\n\n• Adding medicines\n• Creating bills\n• Managing customers\n• Stock management\n• Demand predictions\n• Printing invoices\n\nWhat would you like to know?';
    }

    // Default response
    return 'I understand you\'re asking about: "' + userMessage + '"\n\nI can help you with:\n• Stock Management\n• Billing & Invoices\n• Customer Management\n• Demand Predictions\n• General Queries\n\nCould you please be more specific about what you need help with?';
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMsg = {
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage);
      const botMsg = {
        type: 'bot',
        text: botResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 bg-gradient-to-br from-blue-600 to-purple-600 hover:shadow-blue-500/50 text-white animate-pulse"
        title="Open Pharmacy Assistant"
      >
        <MessageCircle size={28} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-ping"></span>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${isMinimized ? 'w-80' : 'w-96'} ${isMinimized ? 'h-16' : 'h-[600px]'} flex flex-col shadow-2xl rounded-2xl overflow-hidden transition-all glass border ${isDark ? 'border-gray-700' : 'border-white/40'} animate-slideIn`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Bot size={24} />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
          </div>
          <div>
            <h3 className="font-bold text-lg">Pharmacy Assistant</h3>
            <p className="text-xs opacity-90 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Online • Always ready to help
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-110"
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-90"
            title="Close chat"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.type === 'bot'
                    ? 'bg-blue-600 text-white'
                    : isDark ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
                }`}>
                  {msg.type === 'bot' ? <Bot size={18} /> : <User size={18} />}
                </div>
                <div className={`max-w-[70%] ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-3 rounded-2xl ${
                    msg.type === 'bot'
                      ? isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                      : isDark ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
                  } shadow-md`}>
                    <p className="text-sm whitespace-pre-line">{msg.text}</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2">
                    {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={18} />
                </div>
                <div className={`p-3 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className={`p-3 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <p className="text-xs font-semibold mb-2 text-gray-500 dark:text-gray-400">Quick Questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickResponses.slice(0, 3).map((qr, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(qr.question)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                      isDark 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {qr.question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className={`p-4 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your question..."
                className={`flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
