import { ViewStyle } from 'react-native';
import { spacing, colors } from '@/constants/Colors';

export const layout = {
  container: {
    flex: 1,
    backgroundColor: colors.bg.base,
  } as ViewStyle,
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 100,
  } as ViewStyle,
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
};
