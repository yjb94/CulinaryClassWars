import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import { FoodChoice } from './App';

export type GuestProps = {
  choice: FoodChoice;
  isRevealed: boolean;
};

function Guest({ choice, isRevealed }: GuestProps) {
  const { styles } = useStyles(stylesheet);

  const style = StyleSheet.compose(styles.container, {
    backgroundColor:
      choice === undefined || !isRevealed
        ? '#D2042D'
        : choice === FoodChoice.black
        ? 'black'
        : '#F2F2F2',
  });

  return <View style={style}></View>;
}

const stylesheet = createStyleSheet(() => ({
  container: {
    width: 15,
    height: 30,
  },
}));

export default Guest;
