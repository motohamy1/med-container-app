import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

export const createScrollStackStyles = () => {
  return StyleSheet.create({
    container: {
      width: '100%',
      alignItems: 'center',
    },
    stackContainer: {
      width: '100%',
      minHeight: 390,
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardWrapper: {
      position: 'absolute',
      width: '100%',
      top: 0,
      left: 0,
      right: 0,
    },
    paginationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
      gap: 8,
    },
    paginationDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
    },
    paginationDotActive: {
      width: 24,
      height: 7,
      borderRadius: 4,
      backgroundColor: Colors.lime,
    },
    navArrow: {
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
  });
};
