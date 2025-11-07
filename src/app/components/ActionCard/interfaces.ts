import type { StyleProp, ViewStyle, TextStyle } from 'react-native';

export type ActionCardProps = {
  icon?: string;
  label: string;
  onPress: () => void;
  fullWidth?: boolean;
  borderColor?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};