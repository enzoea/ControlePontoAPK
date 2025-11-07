import type { TextStyle, ViewStyle } from 'react-native';

export type InlineHeaderProps = {
  title: string;
  backColor?: string;
  backSize?: number;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  showBack?: boolean;
  onBack?: () => void;
};