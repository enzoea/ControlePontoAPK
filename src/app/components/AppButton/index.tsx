import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import type { AppButtonProps } from './interfaces';
import { styles } from './styles';

export default function AppButton({ label, onPress, variant = 'primary', disabled, style, textStyle }: AppButtonProps) {
  const containerStyle = [styles.base];
  const labelStyle = [styles.label];

  if (variant === 'outline') {
    containerStyle.push(styles.outline);
    labelStyle.push(styles.labelOutline);
  } else if (variant === 'danger') {
    containerStyle.push(styles.danger);
    labelStyle.push(styles.labelDanger);
  } else {
    containerStyle.push(styles.primary);
  }

  if (disabled) containerStyle.push(styles.disabled);

  return (
    <TouchableOpacity accessibilityRole="button" disabled={disabled} style={[...containerStyle, style]} onPress={onPress}>
      <Text style={[...labelStyle, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}