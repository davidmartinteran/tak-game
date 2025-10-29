import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Modal } from '../feedback/Modal';

describe('Modal', () => {
  it('renders when visible', () => {
    const { getByText } = render(
      <Modal visible={true} onClose={() => {}} title="Test Modal">
        <Text>Modal content</Text>
      </Modal>
    );
    
    expect(getByText('Test Modal')).toBeTruthy();
    expect(getByText('Modal content')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { getByTestId } = render(
      <Modal visible={false} onClose={() => {}} title="Test Modal" testID="modal">
        <Text>Modal content</Text>
      </Modal>
    );
    
    // In test environment, we can verify the modal component exists but with visible=false
    const modal = getByTestId('modal');
    expect(modal.props.visible).toBe(false);
  });

  it('calls onClose when close button is pressed', () => {
    const mockOnClose = jest.fn();
    const { getByLabelText } = render(
      <Modal visible={true} onClose={mockOnClose} title="Test Modal" />
    );
    
    fireEvent.press(getByLabelText('Close modal'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders primary and secondary actions', () => {
    const mockPrimary = jest.fn();
    const mockSecondary = jest.fn();
    
    const { getByText } = render(
      <Modal 
        visible={true} 
        onClose={() => {}} 
        title="Test Modal"
        primaryAction={{ title: 'Confirm', onPress: mockPrimary }}
        secondaryAction={{ title: 'Cancel', onPress: mockSecondary }}
      />
    );
    
    expect(getByText('Confirm')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
    
    fireEvent.press(getByText('Confirm'));
    fireEvent.press(getByText('Cancel'));
    
    expect(mockPrimary).toHaveBeenCalledTimes(1);
    expect(mockSecondary).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility properties', () => {
    const { getByLabelText } = render(
      <Modal 
        visible={true} 
        onClose={() => {}} 
        title="Test Modal"
        accessibilityLabel="Custom modal label"
      />
    );
    
    expect(getByLabelText('Custom modal label')).toBeTruthy();
  });
});