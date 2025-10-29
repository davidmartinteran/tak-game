// This file is temporarily commented out due to missing @react-navigation/stack dependency
// import { StackNavigationOptions } from '@react-navigation/stack';

// export const slideFromRightAnimation: StackNavigationOptions = {
//   gestureEnabled: true,
//   gestureDirection: 'horizontal',
//   cardStyleInterpolator: ({ current, layouts }) => {
//     return {
//       cardStyle: {
//         transform: [
//           {
//             translateX: current.progress.interpolate({
//               inputRange: [0, 1],
//               outputRange: [layouts.screen.width, 0],
//             }),
//           },
//         ],
//       },
//     };
//   },
// };

// export const slideFromBottomAnimation: StackNavigationOptions = {
//   gestureEnabled: true,
//   gestureDirection: 'vertical',
//   cardStyleInterpolator: ({ current, layouts }) => {
//     return {
//       cardStyle: {
//         transform: [
//           {
//             translateY: current.progress.interpolate({
//               inputRange: [0, 1],
//               outputRange: [layouts.screen.height, 0],
//             }),
//           },
//         ],
//       },
//     };
//   },
// };

// export const fadeAnimation: StackNavigationOptions = {
//   cardStyleInterpolator: ({ current }) => {
//     return {
//       cardStyle: {
//         opacity: current.progress,
//       },
//     };
//   },
// };