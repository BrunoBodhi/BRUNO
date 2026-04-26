
// utils/styleUtils.ts

import React from 'react'; // Add React import for CSSProperties type

/**
 * Utility to generate darker/lighter shades of a hex color.
 * @param hex The base hex color string (e.g., "#ff0000").
 * @param percent Percentage to lighten (positive) or darken (negative).
 * @returns A new hex color string.
 */
export const adjustHexColor = (hex: string, percent: number): string => {
  if (!hex || typeof hex !== 'string') return '#000000';
  let useHash = false;
  if (hex.startsWith('#')) {
    hex = hex.slice(1);
    useHash = true;
  }
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  if (hex.length !== 6) return (useHash ? '#' : '') + '000000';

  const num = parseInt(hex, 16);
  let r = (num >> 16);
  let g = (num >> 8) & 0x00FF;
  let b = num & 0x0000FF;

  const amount = Math.floor(255 * (percent / 100));
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));

  const toHex = (c: number) => ('00' + Math.round(c).toString(16)).slice(-2);
  const newHex = toHex(r) + toHex(g) + toHex(b);

  return (useHash ? '#' : '') + newHex;
};

/**
 * Converts a hex color string to an RGB string.
 * @param hex The base hex color string (e.g., "#ff0000").
 * @returns A string of RGB values (e.g., "255,0,0").
 */
export const hexToRgb = (hex: string): string => {
  if (!hex || typeof hex !== 'string') return '0,0,0';
  let c: any = hex.substring(1).split('');
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  c = '0x' + c.join('');
  return [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',');
};


/**
 * Gera uma string de gradiente linear que simula um efeito metálico.
 * @param baseColor A cor base em formato hex (ex: '#f59e0b').
 * @returns Uma string CSS 'linear-gradient(...)'.
 */
export const getMetallicGradient = (baseColor: string): string => {
  if (!baseColor) return 'linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)'; // Padrão dourado
  
  const palette = {
    '100': adjustHexColor(baseColor, 45), // Brilho mais claro
    '200': adjustHexColor(baseColor, 35), // Brilho claro
    '600': adjustHexColor(baseColor, -15),// Sombra escura
    '700': adjustHexColor(baseColor, -30),// Sombra mais escura
  };
  
  // Estrutura: Sombra -> Brilho Máximo -> Sombra Profunda -> Brilho -> Sombra
  return `linear-gradient(to right, ${palette['600']}, ${palette['100']}, ${palette['700']}, ${palette['200']}, ${palette['600']})`;
};


/**
 * Estilo para o botão SÓLIDO padrão. Gera gradientes baseados na cor fornecida.
 * @param baseColor A cor base em formato hex (ex: '#f59e0b').
 * @returns Um objeto React.CSSProperties com os estilos do botão sólido.
 */
export const getDefaultSolidButtonStyle = (baseColor: string = '#f59e0b'): React.CSSProperties => {
  const commonStyle = { transition: 'all 0.4s cubic-bezier(0.2, 1, 0.3, 1)' };
  
  // Garante que temos uma cor válida
  const color = (baseColor && baseColor !== 'transparent') ? baseColor : '#f59e0b';
  
  // Gera tons para o gradiente
  const light = adjustHexColor(color, 40);
  const secondary = adjustHexColor(color, -10);
  const dark = adjustHexColor(color, -30);
  
  return {
    ...commonStyle,
    backgroundColor: color,
    background: `linear-gradient(180deg, ${light} 0%, ${color} 40%, ${secondary} 100%)`,
    border: 'none',
    boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 0 rgba(0, 0, 0, 0.1), 0 10px 30px -10px ${color}99`,
    color: '#000000'
  };
};

/**
 * Estilo para o botão TRANSPARENTE VIP.
 * @param color A cor base em formato hex (ex: '#f59e0b').
 * @returns Um objeto React.CSSProperties com os estilos do botão transparente.
 */
export const getTransparentButtonStyle = (color: string = '#f59e0b'): React.CSSProperties => {
  const commonStyle = { transition: 'all 0.4s cubic-bezier(0.2, 1, 0.3, 1)' };
  const darkColor = adjustHexColor(color, -20);
  
  return {
      ...commonStyle,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      border: `1px solid ${color}`,
      color: color,
      boxShadow: `inset 0 0 20px ${color}1A, 0 4px 0 ${darkColor}, 0 0 15px ${color}33`
  };
};