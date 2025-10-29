import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MenuScreen } from '../MenuScreen';

describe('MenuScreen', () => {
  const mockOnBoardSizeSelect = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', () => {
    const { getByText } = render(
      <MenuScreen
        visible={true}
        onBoardSizeSelect={mockOnBoardSizeSelect}
        onClose={mockOnClose}
      />
    );

    expect(getByText('Select Board Size')).toBeTruthy();
    expect(getByText('Choose your preferred game complexity')).toBeTruthy();
  });

  it('displays all board size options', () => {
    const { getByText } = render(
      <MenuScreen
        visible={true}
        onBoardSizeSelect={mockOnBoardSizeSelect}
        onClose={mockOnClose}
      />
    );

    expect(getByText('Quick Game (4x4)')).toBeTruthy();
    expect(getByText('Standard Game (5x5)')).toBeTruthy();
    expect(getByText('Extended Game (6x6)')).toBeTruthy();
    expect(getByText('Long Game (7x7)')).toBeTruthy();
    expect(getByText('Epic Game (8x8)')).toBeTruthy();
  });

  it('calls onBoardSizeSelect and onClose when a board size is selected', () => {
    const { getByText } = render(
      <MenuScreen
        visible={true}
        onBoardSizeSelect={mockOnBoardSizeSelect}
        onClose={mockOnClose}
      />
    );

    fireEvent.press(getByText('Standard Game (5x5)'));

    expect(mockOnBoardSizeSelect).toHaveBeenCalledWith(5);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows correct piece counts for each board size', () => {
    const { getByText, getAllByText } = render(
      <MenuScreen
        visible={true}
        onBoardSizeSelect={mockOnBoardSizeSelect}
        onClose={mockOnClose}
      />
    );

    // Check 4x4 board details
    expect(getByText('15 per player')).toBeTruthy(); // Flat stones for 4x4
    expect(getByText('0 per player')).toBeTruthy(); // Capstones for 4x4

    // Check 5x5 board details
    expect(getByText('21 per player')).toBeTruthy(); // Flat stones for 5x5
    expect(getAllByText('1 per player').length).toBeGreaterThan(0); // Capstones for 5x5 and others
  });
});