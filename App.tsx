
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ChatWidget from './components/ChatWidget';
import ConversationHistory from './components/ConversationHistory';
import FAQManager from './components/FAQManager';
import IntegrationSimulator from './components/IntegrationSimulator';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'chat': return <ChatWidget />;
      case 'history': return <ConversationHistory />;
      case 'faqs': return <FAQManager />;
      case 'simulators': return <IntegrationSimulator />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeView={activeView} setActiveView={setActiveView}>
      {renderContent()}
    </Layout>
  );
};

export default App;
