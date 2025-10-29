import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { EnhancedToast } from '../feedback/EnhancedToast';

describe('EnhancedToast', () => {
  const defaultProps = {
    visible: true,
    message: 'Test message',
    onHide: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render message when visible', () => {
    const { getByText } = render(<EnhancedToast {...defaultProps} />);
    expect(getByText('Test message')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(
      <EnhancedToast {...defaultProps} visible={false} />
    );
    expect(queryByText('Test message')).toBeNull();
  });

  it('should show correct icon for different types', () => {
    const { rerender, getByText } = render(
      <EnhancedToast {...defaultProps} type="success" />
    );
    expect(getByText('✓')).toBeTruthy();

    rerender(<EnhancedToast {...defaultProps} type="error" />);
    expect(getByText('✗')).toBeTruthy();

    rerender(<EnhancedToast {...defaultProps} type="warning" />);
    expect(getByText('⚠')).toBeTruthy();

    rerender(<EnhancedToast {...defaultProps} type="info" />);
    expect(getByText('ℹ')).toBeTruthy();
  });

  it('should show suggestions when provided', () => {
    const suggestions = ['Try again', 'Check your input'];
    const { getByText } = render(
      <EnhancedToast {...defaultProps} suggestions={suggestions} />
    );

    expect(getByText('Tap for suggestions')).toBeTruthy();
  });

  it('should expand suggestions when tapped', () => {
    const suggestions = ['Try again', 'Check your input'];
    const { getByText } = render(
      <EnhancedToast {...defaultProps} suggestions={suggestions} />
    );

    fireEvent.press(getByText('Test message'));
    
    expect(getByText('Suggestions:')).toBeTruthy();
    expect(getByText('• Try again')).toBeTruthy();
    expect(getByText('• Check your input')).toBeTruthy();
  });

  it('should show action button when provided', () => {
    const actionButton = {
      text: 'Retry',
      onPress: jest.fn(),
    };

    const { getByText } = render(
      <EnhancedToast {...defaultProps} actionButton={actionButton} />
    );

    const button = getByText('Retry');
    expect(button).toBeTruthy();

    fireEvent.press(button);
    expect(actionButton.onPress).toHaveBeenCalled();
  });

  it('should show dismiss button when dismissible', () => {
    const { getByText } = render(
      <EnhancedToast {...defaultProps} allowDismiss={true} />
    );

    const dismissButton = getByText('×');
    expect(dismissButton).toBeTruthy();

    fireEvent.press(dismissButton);
    expect(defaultProps.onHide).toHaveBeenCalled();
  });

  it('should not show dismiss button when not dismissible', () => {
    const { queryByText } = render(
      <EnhancedToast {...defaultProps} allowDismiss={false} />
    );

    expect(queryByText('×')).toBeNull();
  });

  it('should auto-hide after duration', async () => {
    const onHide = jest.fn();
    render(
      <EnhancedToast
        {...defaultProps}
        onHide={onHide}
        duration={100}
        persistent={false}
      />
    );

    await waitFor(() => {
      expect(onHide).toHaveBeenCalled();
    }, { timeout: 500 });
  });

  it('should not auto-hide when persistent', async () => {
    const onHide = jest.fn();
    render(
      <EnhancedToast
        {...defaultProps}
        onHide={onHide}
        duration={100}
        persistent={true}
      />
    );

    // Wait longer than duration
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(onHide).not.toHaveBeenCalled();
  });

  it('should not dismiss when persistent and not dismissible', () => {
    const onHide = jest.fn();
    const { getByText } = render(
      <EnhancedToast
        {...defaultProps}
        onHide={onHide}
        persistent={true}
        allowDismiss={false}
      />
    );

    // Try to tap the toast (should not dismiss)
    fireEvent.press(getByText('Test message'));
    expect(onHide).not.toHaveBeenCalled();
  });
});