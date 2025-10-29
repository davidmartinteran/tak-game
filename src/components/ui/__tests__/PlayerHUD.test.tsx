import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PlayerHUD } from '../hud/PlayerHUD';
import { Player, StoneType, PlayerReserve } from '../../../types';

describe('PlayerHUD Component', () => {
  const mockReserve: PlayerReserve = {
    flatStones: 15,
    capstones: 1,
  };

  const defaultProps = {
    player: Player.PLAYER1,
    reserve: mockReserve,
    isCurrentPlayer: true,
    selectedStoneType: null,
    isFirstTurn: false,
    onStoneTypeSelect: jest.fn(),
    onClearSelection: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render player information correctly', () => {
      const { getByText } = render(<PlayerHUD {...defaultProps} />);
      
      expect(getByText('Player 1')).toBeTruthy();
      expect(getByText('15')).toBeTruthy(); // Flat stones count
      expect(getByText('1')).toBeTruthy(); // Capstones count
    });

    it('should show current player indicator when active', () => {
      const { getByText } = render(<PlayerHUD {...defaultProps} />);
      
      expect(getByText('TURN')).toBeTruthy();
    });

    it('should not show current player indicator when inactive', () => {
      const { queryByText } = render(
        <PlayerHUD {...defaultProps} isCurrentPlayer={false} />
      );
      
      expect(queryByText('TURN')).toBeNull();
    });

    it('should render Player 2 correctly', () => {
      const { getByText } = render(
        <PlayerHUD {...defaultProps} player={Player.PLAYER2} />
      );
      
      expect(getByText('Player 2')).toBeTruthy();
    });
  });

  describe('Stone Type Selection', () => {
    it('should render stone type buttons for current player', () => {
      const { getByText } = render(<PlayerHUD {...defaultProps} />);
      
      expect(getByText(/Flat \(15\)/)).toBeTruthy();
      expect(getByText(/Wall \(15\)/)).toBeTruthy();
      expect(getByText(/Capstone \(1\)/)).toBeTruthy();
    });

    it('should not render stone type buttons for inactive player', () => {
      const { queryByText } = render(
        <PlayerHUD {...defaultProps} isCurrentPlayer={false} />
      );
      
      expect(queryByText(/Select Stone Type:/)).toBeNull();
    });

    it('should call onStoneTypeSelect when stone button is pressed', async () => {
      const { getByText } = render(<PlayerHUD {...defaultProps} />);

      fireEvent.press(getByText(/Flat \(15\)/));

      await waitFor(() => {
        expect(defaultProps.onStoneTypeSelect).toHaveBeenCalledWith(StoneType.FLAT);
      });
    });

    it('should show selected stone type with different styling', () => {
      const { getByText } = render(
        <PlayerHUD {...defaultProps} selectedStoneType={StoneType.FLAT} />
      );
      
      const flatButton = getByText(/Flat \(15\)/);
      expect(flatButton).toBeTruthy();
    });

    it('should show clear selection button when stone is selected', () => {
      const { getByText } = render(
        <PlayerHUD {...defaultProps} selectedStoneType={StoneType.FLAT} />
      );
      
      expect(getByText('Clear Selection')).toBeTruthy();
    });

    it('should call onClearSelection when clear button is pressed', () => {
      const { getByText } = render(
        <PlayerHUD {...defaultProps} selectedStoneType={StoneType.FLAT} />
      );
      
      fireEvent.press(getByText('Clear Selection'));
      expect(defaultProps.onClearSelection).toHaveBeenCalledTimes(1);
    });
  });

  describe('First Turn Behavior', () => {
    it('should show opponent stone option during first turn', () => {
      const { getByText } = render(
        <PlayerHUD {...defaultProps} isFirstTurn={true} />
      );
      
      expect(getByText('Place Opponent Stone:')).toBeTruthy();
      expect(getByText('Opponent Flat')).toBeTruthy();
    });

    it('should disable unavailable stone types during first turn', () => {
      const { getByText } = render(
        <PlayerHUD {...defaultProps} isFirstTurn={true} />
      );

      // Only flat stones (as opponent stones) should be available
      const wallButton = getByText(/Wall \(15\)/).parent?.parent;
      const capstoneButton = getByText(/Capstone \(1\)/).parent?.parent;

      expect(wallButton?.props.accessibilityState?.disabled).toBe(true);
      expect(capstoneButton?.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('Stone Availability', () => {
    it('should disable stone types when reserves are empty', () => {
      const emptyReserve: PlayerReserve = {
        flatStones: 0,
        capstones: 0,
      };

      const { getByText } = render(
        <PlayerHUD {...defaultProps} reserve={emptyReserve} />
      );

      const flatButton = getByText(/Flat \(0\)/).parent?.parent;
      const wallButton = getByText(/Wall \(0\)/).parent?.parent;
      const capstoneButton = getByText(/Capstone \(0\)/).parent?.parent;

      expect(flatButton?.props.accessibilityState?.disabled).toBe(true);
      expect(wallButton?.props.accessibilityState?.disabled).toBe(true);
      expect(capstoneButton?.props.accessibilityState?.disabled).toBe(true);
    });

    it('should show correct stone counts', () => {
      const customReserve: PlayerReserve = {
        flatStones: 5,
        capstones: 2,
      };

      const { getByText } = render(
        <PlayerHUD {...defaultProps} reserve={customReserve} />
      );
      
      expect(getByText(/Flat \(5\)/)).toBeTruthy();
      expect(getByText(/Wall \(5\)/)).toBeTruthy();
      expect(getByText(/Capstone \(2\)/)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByLabelText } = render(<PlayerHUD {...defaultProps} />);
      
      expect(getByLabelText('Player 1 controls')).toBeTruthy();
    });

    it('should have proper accessibility states for buttons', () => {
      const { getByText } = render(
        <PlayerHUD {...defaultProps} selectedStoneType={StoneType.FLAT} />
      );

      const flatButton = getByText(/Flat \(15\)/).parent?.parent;
      expect(flatButton?.props.accessibilityState?.selected).toBe(true);
    });

    it('should have proper accessibility hints', () => {
      const { getByLabelText } = render(<PlayerHUD {...defaultProps} />);

      const flatButton = getByLabelText(/flat stone \(15 remaining\)/);
      expect(flatButton.props.accessibilityHint).toContain('Tap to select');
    });
  });
});