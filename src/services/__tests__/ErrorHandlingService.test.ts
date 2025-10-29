import { 
  errorHandlingService, 
  reportError, 
  getUserFriendlyMessage, 
  isRecoverable, 
  getRecoverySuggestions 
} from '../ErrorHandlingService';

describe('ErrorHandlingService', () => {
  beforeEach(() => {
    errorHandlingService.clearErrorHistory();
  });

  describe('reportError', () => {
    it('should report error and add to history', () => {
      const error = new Error('Test error');
      const context = { component: 'TestComponent', action: 'test_action' };

      reportError(error, context, 'medium');

      const history = errorHandlingService.getErrorHistory();
      expect(history).toHaveLength(1);
      expect(history[0].error).toBe(error);
      expect(history[0].context).toEqual(context);
      expect(history[0].severity).toBe('medium');
    });

    it('should limit error history size', () => {
      // Report more errors than the max history size
      for (let i = 0; i < 60; i++) {
        reportError(new Error(`Error ${i}`), {}, 'low');
      }

      const history = errorHandlingService.getErrorHistory();
      expect(history.length).toBeLessThanOrEqual(50);
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return game-specific messages for game errors', () => {
      const error = new Error('Position is already occupied');
      const context = { component: 'GameBoard', action: 'place_stone' };

      const message = getUserFriendlyMessage(error, context);
      expect(message).toBe('That square is already occupied. Choose an empty square.');
    });

    it('should return generic message for unknown errors', () => {
      const error = new Error('Unknown error');
      const context = { component: 'UnknownComponent' };

      const message = getUserFriendlyMessage(error, context);
      expect(message).toBe('An unexpected error occurred. Please try again.');
    });

    it('should handle animation errors gracefully', () => {
      const error = new Error('Animation failed');
      const context = { component: 'StoneAnimation' };

      const message = getUserFriendlyMessage(error, context);
      expect(message).toBe('Animation failed, but the game continues normally.');
    });
  });

  describe('isRecoverable', () => {
    it('should mark game logic errors as recoverable', () => {
      const error = new Error('Invalid move');
      const context = { component: 'GameStore' };

      expect(isRecoverable(error, context)).toBe(true);
    });

    it('should mark critical system errors as non-recoverable', () => {
      const error = new ReferenceError('Variable not defined');
      const context = { component: 'GameStore' };

      expect(isRecoverable(error, context)).toBe(false);
    });

    it('should mark animation errors as recoverable', () => {
      const error = new Error('Animation failed');
      const context = { component: 'StoneAnimation' };

      expect(isRecoverable(error, context)).toBe(true);
    });
  });

  describe('getRecoverySuggestions', () => {
    it('should provide suggestions for stone placement errors', () => {
      const error = new Error('Invalid placement');
      const context = { action: 'place_stone' };

      const suggestions = getRecoverySuggestions(error, context);
      expect(suggestions).toContain('Try selecting a different stone type');
      expect(suggestions).toContain('Choose an empty square on the board');
    });

    it('should provide suggestions for stack movement errors', () => {
      const error = new Error('Invalid move');
      const context = { action: 'move_stack' };

      const suggestions = getRecoverySuggestions(error, context);
      expect(suggestions).toContain('Select a stack you control');
      expect(suggestions).toContain('Choose a valid destination');
    });

    it('should provide default suggestions for unknown errors', () => {
      const error = new Error('Unknown error');
      const context = {};

      const suggestions = getRecoverySuggestions(error, context);
      expect(suggestions).toContain('Try the action again');
      expect(suggestions).toContain('Restart the game if the problem persists');
    });
  });

  describe('error handlers', () => {
    it('should call registered error handlers', () => {
      const mockHandler = jest.fn();
      errorHandlingService.addErrorHandler(mockHandler);

      const error = new Error('Test error');
      const context = { component: 'Test' };
      reportError(error, context, 'high');

      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          error,
          context,
          severity: 'high',
        })
      );

      errorHandlingService.removeErrorHandler(mockHandler);
    });

    it('should handle errors in error handlers gracefully', () => {
      const faultyHandler = jest.fn(() => {
        throw new Error('Handler error');
      });
      
      errorHandlingService.addErrorHandler(faultyHandler);

      // This should not throw
      expect(() => {
        reportError(new Error('Test error'), {}, 'medium');
      }).not.toThrow();

      errorHandlingService.removeErrorHandler(faultyHandler);
    });
  });
});