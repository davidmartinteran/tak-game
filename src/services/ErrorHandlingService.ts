/**
 * Centralized error handling service for the TAK game
 * Provides consistent error reporting, logging, and user feedback
 */

export interface ErrorContext {
  component?: string;
  action?: string;
  gameState?: any;
  additionalInfo?: Record<string, any>;
}

export interface ErrorReport {
  error: Error;
  context: ErrorContext;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export type ErrorHandler = (report: ErrorReport) => void;

class ErrorHandlingService {
  private errorHandlers: ErrorHandler[] = [];
  private errorHistory: ErrorReport[] = [];
  private maxHistorySize = 50;

  /**
   * Register an error handler
   */
  addErrorHandler(handler: ErrorHandler): void {
    this.errorHandlers.push(handler);
  }

  /**
   * Remove an error handler
   */
  removeErrorHandler(handler: ErrorHandler): void {
    const index = this.errorHandlers.indexOf(handler);
    if (index > -1) {
      this.errorHandlers.splice(index, 1);
    }
  }

  /**
   * Report an error with context
   */
  reportError(
    error: Error,
    context: ErrorContext = {},
    severity: ErrorReport['severity'] = 'medium'
  ): void {
    const report: ErrorReport = {
      error,
      context,
      timestamp: new Date(),
      severity,
    };

    // Add to history
    this.errorHistory.unshift(report);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.pop();
    }

    // Log to console
    this.logError(report);

    // Notify handlers
    this.errorHandlers.forEach(handler => {
      try {
        handler(report);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    });
  }

  /**
   * Get error history
   */
  getErrorHistory(): ErrorReport[] {
    return [...this.errorHistory];
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.errorHistory = [];
  }

  /**
   * Create user-friendly error messages
   */
  getUserFriendlyMessage(error: Error, context: ErrorContext): string {
    // Game-specific error messages
    if (context.component === 'GameBoard' || context.component === 'GameStore') {
      if (error.message.includes('Invalid move')) {
        return 'That move is not allowed. Please try a different move.';
      }
      if (error.message.includes('No stones remaining')) {
        return 'You don\'t have any stones of that type left.';
      }
      if (error.message.includes('Position is already occupied')) {
        return 'That square is already occupied. Choose an empty square.';
      }
      if (error.message.includes('Player does not control')) {
        return 'You can only move stacks that you control.';
      }
      if (error.message.includes('Movement blocked')) {
        return 'That path is blocked. Try a different route.';
      }
      if (error.message.includes('carry limit')) {
        return 'You can\'t carry that many stones at once.';
      }
    }

    // Animation errors
    if (context.component?.includes('Animation')) {
      return 'Animation failed, but the game continues normally.';
    }

    // Network/storage errors
    if (error.message.includes('AsyncStorage') || error.message.includes('storage')) {
      return 'Failed to save game data. Your progress might not be saved.';
    }

    // Generic errors by severity
    switch (context.action) {
      case 'place_stone':
        return 'Failed to place stone. Please try again.';
      case 'move_stack':
        return 'Failed to move stack. Please try again.';
      case 'load_game':
        return 'Failed to load game. Starting a new game instead.';
      case 'save_game':
        return 'Failed to save game progress.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Determine if an error is recoverable
   */
  isRecoverable(error: Error, context: ErrorContext): boolean {
    // Critical system errors are not recoverable
    if (error.name === 'ReferenceError' || error.name === 'TypeError') {
      return false;
    }

    // Game logic errors are usually recoverable
    if (context.component === 'GameStore' || context.component === 'MoveValidator') {
      return true;
    }

    // Animation errors are recoverable
    if (context.component?.includes('Animation')) {
      return true;
    }

    // Storage errors are recoverable
    if (error.message.includes('AsyncStorage')) {
      return true;
    }

    // Default to recoverable for user actions
    return true;
  }

  /**
   * Get recovery suggestions
   */
  getRecoverySuggestions(error: Error, context: ErrorContext): string[] {
    const suggestions: string[] = [];

    if (context.action === 'place_stone') {
      suggestions.push('Try selecting a different stone type');
      suggestions.push('Choose an empty square on the board');
    } else if (context.action === 'move_stack') {
      suggestions.push('Select a stack you control');
      suggestions.push('Choose a valid destination');
      suggestions.push('Check the movement path is clear');
    } else if (context.component?.includes('Animation')) {
      suggestions.push('The game will continue without animations');
      suggestions.push('Try restarting the app if animations are important');
    } else if (error.message.includes('storage')) {
      suggestions.push('Check device storage space');
      suggestions.push('Restart the app to retry');
    }

    if (suggestions.length === 0) {
      suggestions.push('Try the action again');
      suggestions.push('Restart the game if the problem persists');
    }

    return suggestions;
  }

  /**
   * Log error with appropriate level
   */
  private logError(report: ErrorReport): void {
    const { error, context, severity, timestamp } = report;
    const prefix = `[${severity.toUpperCase()}] ${timestamp.toISOString()}`;
    
    const contextStr = Object.keys(context).length > 0 
      ? `Context: ${JSON.stringify(context, null, 2)}`
      : '';

    switch (severity) {
      case 'critical':
        console.error(`${prefix} CRITICAL ERROR:`, error);
        if (contextStr) console.error(contextStr);
        break;
      case 'high':
        console.error(`${prefix} HIGH SEVERITY:`, error);
        if (contextStr) console.error(contextStr);
        break;
      case 'medium':
        console.warn(`${prefix} MEDIUM SEVERITY:`, error);
        if (contextStr) console.warn(contextStr);
        break;
      case 'low':
        console.info(`${prefix} LOW SEVERITY:`, error);
        if (contextStr) console.info(contextStr);
        break;
    }
  }
}

// Export singleton instance
export const errorHandlingService = new ErrorHandlingService();

// Convenience functions
export const reportError = (
  error: Error,
  context: ErrorContext = {},
  severity: ErrorReport['severity'] = 'medium'
) => {
  errorHandlingService.reportError(error, context, severity);
};

export const getUserFriendlyMessage = (error: Error, context: ErrorContext = {}) => {
  return errorHandlingService.getUserFriendlyMessage(error, context);
};

export const isRecoverable = (error: Error, context: ErrorContext = {}) => {
  return errorHandlingService.isRecoverable(error, context);
};

export const getRecoverySuggestions = (error: Error, context: ErrorContext = {}) => {
  return errorHandlingService.getRecoverySuggestions(error, context);
};