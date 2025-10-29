import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { EnhancedToast } from '../components/ui/feedback/EnhancedToast';
import { 
  errorHandlingService, 
  ErrorContext as ErrorContextType, 
  ErrorReport,
  getUserFriendlyMessage,
  isRecoverable,
  getRecoverySuggestions
} from '../services/ErrorHandlingService';

export interface ErrorContextValue {
  reportError: (
    error: Error,
    context?: ErrorContextType,
    severity?: ErrorReport['severity']
  ) => void;
  showErrorToast: (
    error: Error,
    context?: ErrorContextType,
    options?: {
      persistent?: boolean;
      actionButton?: {
        text: string;
        onPress: () => void;
      };
    }
  ) => void;
  showSuccessToast: (message: string) => void;
  showWarningToast: (message: string, suggestions?: string[]) => void;
  showInfoToast: (message: string) => void;
  clearToast: () => void;
  getErrorHistory: () => ErrorReport[];
  clearErrorHistory: () => void;
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

export const useErrorHandler = (): ErrorContextValue => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorHandler must be used within an ErrorProvider');
  }
  return context;
};

interface ToastState {
  visible: boolean;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  suggestions: string[];
  persistent: boolean;
  actionButton?: {
    text: string;
    onPress: () => void;
  };
}

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [toastState, setToastState] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
    suggestions: [],
    persistent: false,
  });

  const hideToast = useCallback(() => {
    setToastState(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const showToast = useCallback((
    message: string,
    type: ToastState['type'],
    suggestions: string[] = [],
    persistent = false,
    actionButton?: ToastState['actionButton']
  ) => {
    setToastState({
      visible: true,
      message,
      type,
      suggestions,
      persistent,
      actionButton,
    });
  }, []);

  const reportError = useCallback((
    error: Error,
    context: ErrorContextType = {},
    severity: ErrorReport['severity'] = 'medium'
  ) => {
    errorHandlingService.reportError(error, context, severity);
  }, []);

  const showErrorToast = useCallback((
    error: Error,
    context: ErrorContextType = {},
    options: {
      persistent?: boolean;
      actionButton?: {
        text: string;
        onPress: () => void;
      };
    } = {}
  ) => {
    // Report the error first
    const severity = options.persistent ? 'high' : 'medium';
    reportError(error, context, severity);

    // Get user-friendly message and suggestions
    const message = getUserFriendlyMessage(error, context);
    const suggestions = isRecoverable(error, context) 
      ? getRecoverySuggestions(error, context)
      : [];

    // Show toast with error details
    showToast(
      message,
      'error',
      suggestions,
      options.persistent || false,
      options.actionButton
    );
  }, [reportError, showToast]);

  const showSuccessToast = useCallback((message: string) => {
    showToast(message, 'success');
  }, [showToast]);

  const showWarningToast = useCallback((message: string, suggestions: string[] = []) => {
    showToast(message, 'warning', suggestions);
  }, [showToast]);

  const showInfoToast = useCallback((message: string) => {
    showToast(message, 'info');
  }, [showToast]);

  const clearToast = useCallback(() => {
    hideToast();
  }, [hideToast]);

  const getErrorHistory = useCallback(() => {
    return errorHandlingService.getErrorHistory();
  }, []);

  const clearErrorHistory = useCallback(() => {
    errorHandlingService.clearErrorHistory();
  }, []);

  const value: ErrorContextValue = {
    reportError,
    showErrorToast,
    showSuccessToast,
    showWarningToast,
    showInfoToast,
    clearToast,
    getErrorHistory,
    clearErrorHistory,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <EnhancedToast
        visible={toastState.visible}
        message={toastState.message}
        type={toastState.type}
        suggestions={toastState.suggestions}
        persistent={toastState.persistent}
        actionButton={toastState.actionButton}
        onHide={hideToast}
        duration={toastState.type === 'error' ? 5000 : 3000}
      />
    </ErrorContext.Provider>
  );
};