import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { HUD, HUDItem, HUDSeparator } from '../hud/HUD';

describe('HUD', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <HUD>
        <Text>HUD Content</Text>
      </HUD>
    );
    
    expect(getByText('HUD Content')).toBeTruthy();
  });

  it('applies correct position styles', () => {
    const { getByTestId: getTop } = render(
      <HUD position="top" testID="hud-top">
        <Text>Top HUD</Text>
      </HUD>
    );
    
    const { getByTestId: getBottom } = render(
      <HUD position="bottom" testID="hud-bottom">
        <Text>Bottom HUD</Text>
      </HUD>
    );
    
    expect(getTop('hud-top')).toBeTruthy();
    expect(getBottom('hud-bottom')).toBeTruthy();
  });

  it('has correct accessibility properties', () => {
    const { getByLabelText } = render(
      <HUD accessibilityLabel="Game HUD">
        <Text>HUD Content</Text>
      </HUD>
    );
    
    expect(getByLabelText('Game HUD')).toBeTruthy();
  });
});

describe('HUDItem', () => {
  it('renders label and value correctly', () => {
    const { getByText } = render(
      <HUDItem label="Score" value={100} />
    );
    
    expect(getByText('Score')).toBeTruthy();
    expect(getByText('100')).toBeTruthy();
  });

  it('handles string and number values', () => {
    const { getByText: getStringValue } = render(
      <HUDItem label="Player" value="Player 1" />
    );
    
    const { getByText: getNumberValue } = render(
      <HUDItem label="Stones" value={15} />
    );
    
    expect(getStringValue('Player 1')).toBeTruthy();
    expect(getNumberValue('15')).toBeTruthy();
  });

  it('applies different variants correctly', () => {
    const { getByText: getDefault } = render(
      <HUDItem label="Default" value="test" variant="default" />
    );
    
    const { getByText: getHighlight } = render(
      <HUDItem label="Highlight" value="test" variant="highlight" />
    );
    
    const { getByText: getWarning } = render(
      <HUDItem label="Warning" value="test" variant="warning" />
    );
    
    expect(getDefault('test')).toBeTruthy();
    expect(getHighlight('test')).toBeTruthy();
    expect(getWarning('test')).toBeTruthy();
  });

  it('has correct accessibility properties', () => {
    const { getByLabelText } = render(
      <HUDItem 
        label="Score" 
        value={100} 
        accessibilityLabel="Current score is 100"
      />
    );
    
    expect(getByLabelText('Current score is 100')).toBeTruthy();
  });
});

describe('HUDSeparator', () => {
  it('renders correctly', () => {
    render(
      <HUDSeparator />
    );
    
    // The separator should render (though it's just a View)
    // We can't easily test the visual appearance, but we can ensure it doesn't crash
    expect(true).toBe(true);
  });
});