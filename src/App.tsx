import { useEffect, useRef, useState } from 'react';
import { AssessmentProvider, useAssessment } from './contexts/AssessmentContext';
import { AppShell } from './components/layout/AppShell';
import { SetupScreen } from './components/assessment/SetupScreen';
import { DimensionView } from './components/assessment/DimensionView';
import { SummaryScreen } from './components/summary/SummaryScreen';
import { InterviewMode } from './components/interview/InterviewMode';
import { useFileManagement } from './hooks/useFileManagement';

// Check if running in Tauri
const isTauri = () => {
  return typeof window !== 'undefined' && '__TAURI__' in window;
};

function AppContent() {
  const { state, dispatch } = useAssessment();
  const { saveAssessment, loadAssessment } = useFileManagement();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-save on beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.ui.isDirty) {
        // Note: async operations in beforeunload are unreliable
        // We'll just show the warning, actual save happens on user action
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.ui.isDirty]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLoad = async () => {
    if (isTauri()) {
      // Use Tauri's open dialog
      try {
        // @ts-expect-error - Tauri API only available in Tauri environment
        const dialog = await import('@tauri-apps/api/dialog');
        const filePath = await dialog.open({
          multiple: false,
          filters: [{
            name: 'JSON',
            extensions: ['json']
          }]
        });

        if (filePath && typeof filePath === 'string') {
          const result = await loadAssessment(filePath);
          if (result.success) {
            showNotification('Assessment loaded successfully!', 'success');
            dispatch({
              type: 'NAVIGATE',
              payload: { currentPillar: 'summary' },
            });
          } else {
            showNotification(`Failed to load: ${result.error}`, 'error');
          }
        }
      } catch (error) {
        showNotification(`Failed to open file: ${error}`, 'error');
      }
    } else {
      // Use browser file input
      fileInputRef.current?.click();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await loadAssessment(file);
      if (result.success) {
        showNotification('Assessment loaded successfully!', 'success');
        // Navigate to summary to show loaded data
        dispatch({
          type: 'NAVIGATE',
          payload: { currentPillar: 'summary' },
        });
      } else {
        showNotification(`Failed to load: ${result.error}`, 'error');
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    const result = await saveAssessment();
    if (result.success) {
      showNotification(`Assessment saved: ${result.filename}`, 'success');
    } else {
      showNotification(`Failed to save: ${result.error}`, 'error');
    }
  };

  const renderContent = () => {
    const { currentPillar } = state.ui.navigation;

    switch (currentPillar) {
      case 'setup':
        return <SetupScreen />;
      case 'summary':
        return <SummaryScreen />;
      case 'interview':
        return <InterviewMode />;
      case 'networks':
      case 'applicationsWorkloads':
      case 'data':
      case 'crossCutting':
        return <DimensionView />;
      default:
        return <SetupScreen />;
    }
  };

  return (
    <>
      <AppShell
        onLoad={handleLoad}
        onSave={handleSave}
      >
        {renderContent()}
      </AppShell>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className={`px-6 py-4 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <AssessmentProvider>
      <AppContent />
    </AssessmentProvider>
  );
}

export default App;
