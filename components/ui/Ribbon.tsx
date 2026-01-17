import * as React from 'react';
import Box from '@mui/joy/Box';
import {styled} from '@mui/joy/styles';

const RibbonRoot = styled(Box)(({theme}) => ({
  position: 'absolute',
  top: '0.25rem',
  left: 'calc(-1 * 0.5em)',
  paddingInline: '0.4em',
  lineHeight: 1.8,
  fontSize: '0.85rem',
  fontWeight: 600,
  color: theme.vars.palette.neutral.softColor,
  background: theme.vars.palette.neutral.softBg,
  borderBottom: `0.5em solid ${theme.vars.palette.neutral.softActiveBg}`,
  borderRight: '0.8em solid transparent',
  clipPath:
    'polygon(calc(100% - 0.8em) 0, 0 0, 0 calc(100% - 0.5em), 0.5em 100%,' +
    '0.5em calc(100% - 0.5em), calc(100% - 0.8em) calc(100% - 0.5em),' +
    '100% calc(50% - 0.25em))'
}));

type RibbonProps = {
  children: React.ReactNode;
};

export default function Ribbon({children}: RibbonProps) {
  return <RibbonRoot>{children}</RibbonRoot>;
}
