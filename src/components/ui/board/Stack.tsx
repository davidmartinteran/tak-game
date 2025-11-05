import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../../constants/colors";
import { Stack as StackType } from "../../../types";
import { Stone } from "./Stone";

export interface StackProps {
  stack: StackType;
  size?: number;
  showComposition?: boolean;
  isSelected?: boolean;
  isHighlighted?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  animatingStoneId?: string;
}

export const Stack: React.FC<StackProps> = ({
  stack,
  size = 50,
  showComposition = false,
  isSelected = false,
  isHighlighted = false,
  onPress,
  onLongPress,
}) => {
  const { stones, controlledBy } = stack;
  const stoneCount = stones.length;

  if (stoneCount === 0) {
    return null;
  }

  const topStone = stones[stones.length - 1];
  const isMultiStone = stoneCount > 1;

  const accessibilityLabel = `Stack of ${stoneCount} stones controlled by ${
    controlledBy || "none"
  }`;

  const renderContent = () => (
    <View
      style={[
        styles.container,
        { width: size, height: size },
        isSelected && styles.selected,
        isHighlighted && styles.highlighted,
      ]}
    >
      {/* Render top stone */}
      <Stone
        stone={topStone}
        stackIndex={stack.stones.length - 1}
        isTopStone={true}
        size={size * 0.9}
      />

      {/* Height indicator for multi-stone stacks */}
      {isMultiStone && (
        <View style={styles.heightIndicator}>
          <Text style={styles.heightText}>{stoneCount}</Text>
        </View>
      )}

      {/* Composition display (optional, for multi-stone stacks) */}
      {showComposition && isMultiStone && (
        <View style={styles.compositionContainer}>
          {stones.map((stone, index) => (
            <View
              key={stone.id || `${index}`}
              style={[
                styles.compositionDot,
                {
                  backgroundColor:
                    stone.owner === "player1" ? Colors.player1 : Colors.player2,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );

  // If interactive (has onPress or onLongPress), wrap in TouchableOpacity
  if (onPress || onLongPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        activeOpacity={0.7}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return <View accessibilityLabel={accessibilityLabel}>{renderContent()}</View>;
};

Stack.displayName = "Stack";

const styles = StyleSheet.create({
  container: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  selected: {
    borderWidth: 2,
    borderColor: Colors.accent,
    borderRadius: 4,
  },
  highlighted: {
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    borderRadius: 4,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  heightIndicator: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  heightText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  compositionContainer: {
    position: "absolute",
    bottom: 2,
    flexDirection: "row",
    gap: 2,
  },
  compositionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export default Stack;
