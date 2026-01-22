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

  // Auto-download and save on window close/navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.ui.isDirty) {
        // Auto-download JSON backup before closing
        try {
          const json = JSON.stringify(state.assessment, null, 2);
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);

          const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
          const customerName = state.assessment.metadata.customerName || 'Unnamed_Customer';
          const filename = `${customerName}_backup_${timestamp}.json`;

          // Create hidden link and trigger download
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Failed to auto-download backup:', error);
        }

        // Show browser warning
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleUnload = () => {
      // Final save to localStorage before page unloads
      if (state.ui.isDirty) {
        try {
          localStorage.setItem('ztmm-assessment', JSON.stringify(state.assessment));
          localStorage.setItem('ztmm-assessment-timestamp', new Date().toISOString());
        } catch (error) {
          console.error('Failed to save on unload:', error);
        }
      }
    };

    const handleVisibilityChange = () => {
      // Save to localStorage when user switches tabs or minimizes window
      if (document.hidden && state.ui.isDirty) {
        try {
          localStorage.setItem('ztmm-assessment', JSON.stringify(state.assessment));
          localStorage.setItem('ztmm-assessment-timestamp', new Date().toISOString());
        } catch (error) {
          console.error('Failed to save on visibility change:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.ui.isDirty, state.assessment]);

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
