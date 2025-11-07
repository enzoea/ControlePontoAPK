import React from 'react';
import { View, Text, TextInput } from 'react-native';
import type { LabeledInputProps } from './interfaces';
import { styles } from './styles';

export default function LabeledInput({ label, value, onChangeText, placeholder, multiline, style, inputStyle, labelStyle }: LabeledInputProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <TextInput
        style={[styles.input, inputStyle]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
      />
    </View>
  );
}