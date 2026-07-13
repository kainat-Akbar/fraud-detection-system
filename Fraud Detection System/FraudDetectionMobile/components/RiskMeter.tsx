import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Circle, G, Text as SvgText } from 'react-native-svg';
import { BrandColors } from '@/constants/theme';

interface RiskMeterProps {
  probability: number; // 0 to 1
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ probability }) => {
  const size = 220;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Calculate needle rotation: -90 degrees to 90 degrees
  const rotation = (probability * 180) - 90;

  // SVG Arc drawing logic
  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
      const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
      return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
      };
    };

    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size / 1.5} viewBox={`0 0 ${size} ${size / 1.5}`}>
        <G transform={`translate(0, 20)`}>
          {/* Background Arc (Safe to High-Risk) */}
          <Path
            d={describeArc(center, center, radius, -90, -30)}
            fill="none"
            stroke={BrandColors.success}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <Path
            d={describeArc(center, center, radius, -30, 30)}
            fill="none"
            stroke="#FFAB00" // Suspicious Yellow
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <Path
            d={describeArc(center, center, radius, 30, 90)}
            fill="none"
            stroke={BrandColors.danger}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Needle */}
          <G transform={`translate(${center}, ${center}) rotate(${rotation})`}>
             <Path
               d={`M -4 0 L 0 -${radius - 10} L 4 0 Z`}
               fill={BrandColors.textMain}
             />
             <Circle cx="0" cy="0" r="6" fill={BrandColors.textMain} />
          </G>

          {/* Probability Text */}
          <SvgText
            x={center}
            y={center + 30}
            fill={BrandColors.textMain}
            fontSize="20"
            fontWeight="900"
            textAnchor="middle"
          >
            {(probability * 100).toFixed(2)}%
          </SvgText>
        </G>
      </Svg>
      
      <View style={styles.labelsContainer}>
        <Text style={[styles.label, { color: BrandColors.success }]}>SAFE</Text>
        <Text style={[styles.label, { color: "#FFAB00" }]}>CAUTION</Text>
        <Text style={[styles.label, { color: BrandColors.danger }]}>RISK</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: -10,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  }
});
