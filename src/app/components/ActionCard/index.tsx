import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import type { ActionCardProps } from './interfaces';
import { styles } from './styles';

export default function ActionCard({ icon, label, onPress, fullWidth, borderColor, style, labelStyle }: ActionCardProps) {
  const containerStyles = [styles.card];
  if (fullWidth) containerStyles.push(styles.full);
  else containerStyles.push(styles.half);
  if (borderColor) containerStyles.push({ borderColor });

  return (
    <TouchableOpacity activeOpacity={0.85} style={[...containerStyles, style]} onPress={onPress}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={[styles.label, labelStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}