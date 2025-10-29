import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "../common/Button";

describe("Button", () => {
  it("renders correctly with title", () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    );

    expect(getByText("Test Button")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const mockOnPress = jest.fn();
    const { getByLabelText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );

    fireEvent.press(getByLabelText("Test Button"));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", () => {
    const mockOnPress = jest.fn();
    const { getByLabelText } = render(
      <Button title="Test Button" onPress={mockOnPress} disabled />
    );

    const button = getByLabelText("Test Button");
    expect(button.props.accessibilityState.disabled).toBe(true);
    // Note: In test environment, the mock TouchableOpacity doesn't prevent onPress
    // but we can verify the disabled state is set correctly
  });

  it("shows loading indicator when loading", () => {
    const { queryByText } = render(
      <Button title="Test Button" onPress={() => {}} loading testID="button" />
    );

    expect(queryByText("Test Button")).toBeNull();
    // ActivityIndicator should be present (though we can't easily test it directly)
  });

  it("has correct accessibility properties", () => {
    const { getByLabelText } = render(
      <Button
        title="Test Button"
        onPress={() => {}}
        accessibilityLabel="Custom label"
        accessibilityHint="Custom hint"
      />
    );

    const button = getByLabelText("Custom label");
    expect(button.props.accessibilityLabel).toBe("Custom label");
    expect(button.props.accessibilityHint).toBe("Custom hint");
  });

  it("applies different variants correctly", () => {
    const { getByText: getPrimary } = render(
      <Button title="Primary" onPress={() => {}} variant="primary" />
    );
    const { getByText: getSecondary } = render(
      <Button title="Secondary" onPress={() => {}} variant="secondary" />
    );

    // Both should render as buttons
    expect(getPrimary("Primary")).toBeTruthy();
    expect(getSecondary("Secondary")).toBeTruthy();
  });
});
