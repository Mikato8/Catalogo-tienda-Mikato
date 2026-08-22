import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  ColorPicker,
  InputNumber,
  Select,
  Space,
  Typography,
  message,
} from 'antd';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, FUENTES } from '../../contexts/ThemeContext';

export default function ConfiguracionAdmin() {
  const { token } = useAuth();
  const { tema, setTema } = useTheme();
  const [color, setColor] = useState(tema.primaryColor);
  const [fuente, setFuente] = useState(tema.fontFamily);
  const [envioLocal, setEnvioLocal] = useState(0);
  const [envioPaqueteria, setEnvioPaqueteria] = useState(0);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    api('/settings')
      .then((response) => {
        const datos = response.data || {};
        setEnvioLocal(Number(datos.shipping_local_cost || 0));
        setEnvioPaqueteria(Number(datos.shipping_paqueteria_cost || 0));
      })
      .catch(() => {});
  }, []);

  async function guardar() {
    setGuardando(true);

    try {
      const response = await api('/settings', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          primary_color: color,
          font_family: fuente,
          shipping_local_cost: envioLocal,
          shipping_paqueteria_cost: envioPaqueteria,
        }),
      });

      const datos = response.data || {};
      setTema({
        primaryColor: datos.primary_color,
        fontFamily: datos.font_family,
      });
      setEnvioLocal(Number(datos.shipping_local_cost || 0));
      setEnvioPaqueteria(Number(datos.shipping_paqueteria_cost || 0));
      message.success('Configuración guardada y aplicada');
    } catch (error) {
      message.error(error.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Card title="Configuración del sitio">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Typography.Text strong>Color principal</Typography.Text>
          <div style={{ marginTop: 8 }}>
            <ColorPicker
              value={color}
              onChange={(c) => setColor(c.toHexString())}
              showText
              presets={[
                { label: 'Cyan', colors: ['#006877', '#04b0c8'] },
                { label: 'Azul', colors: ['#0b57d0', '#1e3a8a'] },
                { label: 'Verde', colors: ['#1b7f4f', '#14532d'] },
                { label: 'Morado', colors: ['#6a3ab2', '#7c3aed'] },
                { label: 'Rosa', colors: ['#a0006e', '#be185d'] },
                { label: 'Naranja', colors: ['#b55400', '#c2410c'] },
              ]}
            />
          </div>
        </div>

        <div>
          <Typography.Text strong>Tipografía</Typography.Text>
          <div style={{ marginTop: 8 }}>
            <Select
              value={fuente}
              onChange={setFuente}
              style={{ width: 240 }}
              options={FUENTES.map((item) => ({
                value: item.key,
                label: item.label,
              }))}
            />
          </div>
        </div>

        <div>
          <Typography.Text strong>Costo de envío</Typography.Text>
          <div style={{ marginTop: 8, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <Typography.Text>Envío local</Typography.Text>
              <div style={{ marginTop: 4 }}>
                <InputNumber
                  value={envioLocal}
                  onChange={(valor) => setEnvioLocal(Number(valor || 0))}
                  min={0}
                  prefix="$"
                  style={{ width: 160 }}
                />
              </div>
            </div>
            <div>
              <Typography.Text>Envío por paquetería</Typography.Text>
              <div style={{ marginTop: 4 }}>
                <InputNumber
                  value={envioPaqueteria}
                  onChange={(valor) => setEnvioPaqueteria(Number(valor || 0))}
                  min={0}
                  prefix="$"
                  style={{ width: 160 }}
                />
              </div>
            </div>
          </div>
        </div>

        <Button type="primary" loading={guardando} onClick={guardar}>
          Guardar cambios
        </Button>
      </Space>
    </Card>
  );
}
