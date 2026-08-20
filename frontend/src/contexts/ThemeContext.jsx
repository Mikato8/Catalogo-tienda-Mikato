import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ConfigProvider } from 'antd';
import { api } from '../services/api';

export const FUENTES = [
  { key: 'Inter', label: 'Inter' },
  { key: 'Manrope', label: 'Manrope' },
  { key: 'Poppins', label: 'Poppins' },
  { key: 'Roboto', label: 'Roboto' },
  { key: 'Montserrat', label: 'Montserrat' },
  { key: 'Lora', label: 'Lora' },
  { key: 'Open Sans', label: 'Open Sans' },
  { key: 'Playfair Display', label: 'Playfair Display' },
];

const TEMA_INICIAL = { primaryColor: '#006877', fontFamily: 'Inter' };

function hexToRgb(hex) {
  const limpio = hex.replace('#', '');
  const expandido = limpio.length === 3
    ? limpio.split('').map((c) => c + c).join('')
    : limpio;
  const valor = parseInt(expandido, 16);
  return {
    r: (valor >> 16) & 255,
    g: (valor >> 8) & 255,
    b: valor & 255,
  };
}

function mezclar(hex, objetivo, ratio) {
  const origen = hexToRgb(hex);
  const destino = hexToRgb(objetivo);
  const canal = (a, b) => Math.round(a + (b - a) * ratio);
  return `rgb(${canal(origen.r, destino.r)}, ${canal(origen.g, destino.g)}, ${canal(origen.b, destino.b)})`;
}

function cargarFuente(fontFamily) {
  const nombre = fontFamily.replace(/ /g, '+');
  const href = `https://fonts.googleapis.com/css2?family=${nombre}:wght@400;500;600;700&display=swap`;

  let link = document.getElementById('fuente-tema');
  if (!link) {
    link = document.createElement('link');
    link.id = 'fuente-tema';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  link.href = href;
}

function aplicarTema(tema) {
  const root = document.documentElement;
  root.style.setProperty('--primary', tema.primaryColor);
  root.style.setProperty('--secondary', tema.primaryColor);
  root.style.setProperty('--primary-container', mezclar(tema.primaryColor, '#ffffff', 0.72));
  root.style.setProperty('--secondary-container', mezclar(tema.primaryColor, '#ffffff', 0.72));
  root.style.setProperty('--on-primary-container', mezclar(tema.primaryColor, '#000000', 0.35));
  root.style.setProperty('--font-family', `'${tema.fontFamily}'`);
  cargarFuente(tema.fontFamily);
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(TEMA_INICIAL);

  useEffect(() => {
    api('/settings')
      .then((response) => {
        const datos = response.data || {};
        setTema({
          primaryColor: datos.primary_color || TEMA_INICIAL.primaryColor,
          fontFamily: datos.font_family || TEMA_INICIAL.fontFamily,
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    aplicarTema(tema);
  }, [tema]);

  const antdTheme = useMemo(() => ({
    token: {
      colorPrimary: tema.primaryColor,
      colorInfo: tema.primaryColor,
      colorLink: tema.primaryColor,
      borderRadius: 6,
      fontFamily: `'${tema.fontFamily}', system-ui, sans-serif`,
      colorBgLayout: '#f9f9ff',
    },
  }), [tema]);

  const valor = useMemo(() => ({ tema, setTema }), [tema]);

  return (
    <ThemeContext.Provider value={valor}>
      <ConfigProvider theme={antdTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
