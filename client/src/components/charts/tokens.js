import { useTheme } from '../../context/ThemeContext.jsx';

/**
 * Chart colour roles.
 *
 * Both modes are selected values, not an automatic flip, and the categorical
 * pair was checked with the palette validator against each surface
 * (light #ffffff, dark #171c2b): lightness band, chroma floor, CVD separation,
 * normal-vision separation and 3:1 contrast all pass.
 */
const LIGHT = {
  series1: '#2a78d6',
  series2: '#eb6834',
  neutral: '#cbd2df',
  grid: 'rgba(100, 116, 139, 0.18)',
  axis: '#677390',
  surface: '#ffffff',
  tooltipBorder: 'rgba(15, 23, 42, 0.08)',
  ink: '#171c2b',
};

const DARK = {
  series1: '#3987e5',
  series2: '#d95926',
  neutral: '#3b4459',
  grid: 'rgba(148, 163, 184, 0.16)',
  axis: '#8693ab',
  surface: '#171c2b',
  tooltipBorder: 'rgba(255, 255, 255, 0.12)',
  ink: '#ffffff',
};

/** Status ramp — reserved for state, never reused as a series colour. */
export const STATUS = {
  good: { light: '#1baf7a', dark: '#199e70' },
  warning: { light: '#eda100', dark: '#c98500' },
  critical: { light: '#e34948', dark: '#e66767' },
};

export function useChartTokens() {
  const { isDark } = useTheme();
  const tokens = isDark ? DARK : LIGHT;
  return {
    ...tokens,
    isDark,
    status: {
      good: isDark ? STATUS.good.dark : STATUS.good.light,
      warning: isDark ? STATUS.warning.dark : STATUS.warning.light,
      critical: isDark ? STATUS.critical.dark : STATUS.critical.light,
    },
  };
}
