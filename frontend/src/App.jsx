import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import EthicsModal from './components/EthicsModal';
import { api } from './api/client';

// Pages
import OverviewPage from './pages/OverviewPage';
import TextAnalyticsPage from './pages/TextAnalyticsPage';
import EntityTopicPage from './pages/EntityTopicPage';
import SentimentPage from './pages/SentimentPage';
import WebAnalyticsPage from './pages/WebAnalyticsPage';
import SocialMiningPage from './pages/SocialMiningPage';
import GameRecommenderPage from './pages/GameRecommenderPage';
import ModelEvaluationPage from './pages/ModelEvaluationPage';
import DriftMonitoringPage from './pages/DriftMonitoringPage';
import DataManagementPage from './pages/DataManagementPage';
import EthicsDocumentationPage from './pages/EthicsDocumentationPage';

const PAGE_TITLES = {
  'overview': 'Overview Dashboard',
  'text-analytics': 'Text Analytics & NLP Preprocessing',
  'entities-topics': 'Named Entities & Topic Discovery',
  'sentiment': 'Sentiment Classification & Distribution',
  'social-mining': 'Social Media Mining & Network Analysis',
  'recommendations': 'Personalized Game Recommendation Engine',
  'web-analytics': 'Web Analytics & Statistical A/B Testing',
  'model-eval': 'Model Evaluation & Explainable AI (XAI)',
  'drift-monitor': 'Data Drift Monitoring & Feedback Queue',
  'data-mgmt': 'Data Ingestion & Dataset Management',
  'ethics': 'Ethics, Privacy & Syllabus Architecture Guide',
};

export default function App() {
  const [activePage, setActivePage] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [isEthicsModalOpen, setIsEthicsModalOpen] = useState(false);

  useEffect(() => {
    checkHealthAndLoadDashboard();
  }, []);

  async function checkHealthAndLoadDashboard() {
    try {
      setLoadingDashboard(true);
      const [healthRes, dashRes] = await Promise.all([
        api.getHealth().catch(() => null),
        api.getDashboard().catch(() => null)
      ]);

      if (healthRes && healthRes.status === 'healthy') {
        setIsBackendOnline(true);
      } else {
        setIsBackendOnline(false);
      }

      if (dashRes) {
        setDashboardData(dashRes);
      }
    } catch (err) {
      console.error("Dashboard initialization error:", err);
      setIsBackendOnline(false);
    } finally {
      setLoadingDashboard(false);
    }
  }

  function handleDatasetChanged() {
    checkHealthAndLoadDashboard();
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#111214] text-[#dbdee1]">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        stats={dashboardData}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          activePageTitle={PAGE_TITLES[activePage] || 'Discord Text Web Analysis'}
          isBackendOnline={isBackendOnline}
          stats={dashboardData}
          onRefresh={checkHealthAndLoadDashboard}
          onOpenEthics={() => setIsEthicsModalOpen(true)}
        />

        {/* Page View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {activePage === 'overview' && (
              <OverviewPage
                data={dashboardData}
                loading={loadingDashboard}
                onRefresh={checkHealthAndLoadDashboard}
                onNavigate={setActivePage}
              />
            )}

            {activePage === 'text-analytics' && <TextAnalyticsPage />}

            {activePage === 'entities-topics' && <EntityTopicPage />}

            {activePage === 'sentiment' && <SentimentPage />}

            {activePage === 'social-mining' && <SocialMiningPage />}

            {activePage === 'recommendations' && <GameRecommenderPage />}

            {activePage === 'web-analytics' && <WebAnalyticsPage />}

            {activePage === 'model-eval' && <ModelEvaluationPage />}

            {activePage === 'drift-monitor' && <DriftMonitoringPage />}

            {activePage === 'data-mgmt' && (
              <DataManagementPage onDatasetChanged={handleDatasetChanged} />
            )}

            {activePage === 'ethics' && <EthicsDocumentationPage />}
          </div>
        </main>
      </div>

      {/* Ethics & Syllabus Modal */}
      <EthicsModal
        isOpen={isEthicsModalOpen}
        onClose={() => setIsEthicsModalOpen(false)}
      />
    </div>
  );
}
