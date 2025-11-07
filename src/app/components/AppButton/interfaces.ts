import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export type AppButtonVariant = 'primary' | 'outline' | 'danger';

export type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};