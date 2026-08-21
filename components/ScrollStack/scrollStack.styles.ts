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
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'flex-start',
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
      marginTop: 4, // Reduced by 50% for snug fit directly under the card
      gap: 6,
      paddingVertical: 2,
    },
    paginationDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
    },
    paginationDotActive: {
      width: 18,
      height: 6,
      borderRadius: 3,
      backgroundColor: Colors.lime,
    },
    navArrow: {
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
  });
};
