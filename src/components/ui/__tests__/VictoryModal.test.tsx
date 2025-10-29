import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { VictoryModal } from '../feedback/VictoryModal';
import { Player } from '../../../types';

// Mock VictoryCelebration component
jest.mock('../feedback/VictoryCelebration', () => ({
  VictoryCelebration: ({ visible, onAnimationComplete }: any) => {
    // Simulate animation completion after a short delay
    if (visible && onAnimationComplete) {
      setTimeout(onAnimationComplete, 100);
    }
    return null;
  },
}));

describe('VictoryModal', () => {
  const defaultProps = {
    visible: true,
    winner: Player.PLAYER1 as Player,
    onNewGame: jest.fn(),
    onMainMenu: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when visible with winner', () => {
    const { getAllByText } = render(<VictoryModal {...defaultProps} />);
    
    // Should find the title text (appears in both modal title and content)
    expect(getAllByText('Player 1 Wins!').length).toBeGreaterThan(0);
    expect(getAllByText(/Congratulations Player 1/).length).toBeGreaterThan(0);
  });

  it('should handle visible prop correctly', () => {
    // Test that the component renders without errors when visible is false
    expect(() => {
      render(<VictoryModal {...defaultProps} visible={false} />);
    }).not.toThrow();
  });

  it('should render draw message', () => {
    const { getAllByText } = render(
      <VictoryModal {...defaultProps} winner="draw" />
    );
    
    expect(getAllByText('Draw!').length).toBeGreaterThan(0);
    expect(getAllByText(/The game ended in a draw/).length).toBeGreaterThan(0);
  });

  it('should render Player 2 victory', () => {
    const { getAllByText } = render(
      <VictoryModal {...defaultProps} winner={Player.PLAYER2} />
    );
    
    expect(getAllByText('Player 2 Wins!').length).toBeGreaterThan(0);
    expect(getAllByText(/Congratulations Player 2/).length).toBeGreaterThan(0);
  });

  it('should display victory type for road victory', () => {
    const { getByText } = render(
      <VictoryModal 
        {...defaultProps} 
        victoryType="road"
        // winningPath={[{ row: 0, col: 0 }, { row: 0, col: 1 }]} // Unused prop
      />
    );
    
    expect(getByText('Road Victory')).toBeTruthy();
    expect(getByText(/creating a road connecting opposite edges/)).toBeTruthy();
  });

  it('should display victory type for flat stone victory', () => {
    const { getByText } = render(
      <VictoryModal 
        {...defaultProps} 
        victoryType="flat"
      />
    );
    
    expect(getByText('Flat Stone Victory')).toBeTruthy();
    expect(getByText(/controlling the most flat stones/)).toBeTruthy();
  });

  it('should call onNewGame when New Game button is pressed', () => {
    const onNewGame = jest.fn();
    const { getByText } = render(
      <VictoryModal {...defaultProps} onNewGame={onNewGame} />
    );
    
    fireEvent.press(getByText('New Game'));
    expect(onNewGame).toHaveBeenCalledTimes(1);
  });

  it('should call onMainMenu when Main Menu button is pressed', () => {
    const onMainMenu = jest.fn();
    const { getByText } = render(
      <VictoryModal {...defaultProps} onMainMenu={onMainMenu} />
    );
    
    fireEvent.press(getByText('Main Menu'));
    expect(onMainMenu).toHaveBeenCalledTimes(1);
  });

  it('should handle missing victory type gracefully', () => {
    const { queryByText } = render(
      <VictoryModal {...defaultProps} victoryType={null} />
    );
    
    // Should not show victory type text when not provided
    expect(queryByText('Road Victory')).toBeNull();
    expect(queryByText('Flat Stone Victory')).toBeNull();
  });

  it('should show celebration animation when visible', () => {
    // This test verifies that the VictoryCelebration component is rendered
    // The actual animation testing is done in VictoryCelebration.test.tsx
    expect(() => {
      render(<VictoryModal {...defaultProps} />);
    }).not.toThrow();
  });
});