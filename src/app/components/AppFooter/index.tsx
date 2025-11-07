import React from 'react';
import { View, Text, Linking } from 'react-native';
import type { AppFooterProps } from './interfaces';
import { styles } from './styles';

const LINKEDIN_URL = 'https://www.linkedin.com/in/enzomartinsdev/';

export default function AppFooter({ style, textStyle }: AppFooterProps) {
  return (
    <View style={[styles.container, style]}> 
      <Text style={[styles.text, textStyle]}>
        Desenvolvido por{' '}
        <Text accessibilityRole="link" style={styles.link} onPress={() => Linking.openURL(LINKEDIN_URL)}>
          Enzo Martins
        </Text>
      </Text>
    </View>
  );
}