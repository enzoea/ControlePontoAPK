import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { InlineHeaderProps } from './interfaces';
import { styles } from './styles';

export default function InlineHeader({ title, backColor, backSize, style, titleStyle, showBack, onBack }: InlineHeaderProps) {
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();
  const backVisible = showBack ?? canGoBack;
  const handleBack = onBack ?? (() => navigation.goBack());

  return (
    <View style={[styles.headerRow, style]}> 
      {backVisible && (
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Voltar" onPress={handleBack} style={styles.backInline}>
          <Text style={[styles.backInlineText, { color: backColor ?? '#000', fontSize: backSize ?? 28 }]}>←</Text>
        </TouchableOpacity>
      )}
      <Text style={[styles.title, titleStyle]}>{title}</Text>
    </View>
  );
}