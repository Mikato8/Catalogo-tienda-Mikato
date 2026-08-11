import { Alert, Button, Card, Form, Input, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Acceso({ registro = false }) {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { iniciarSesion, registrar } = useAuth();

  async function enviar(values) {
    try {
      if (registro) {
        await registrar({ email: values.email, password: values.password, name: values.name });
        message.success('Cuenta creada');
      } else {
        await iniciarSesion(values.email, values.password);
      }
      navigate('/');
    } catch (error) {
      message.error(error.message);
    }
  }

  return (
    <Card className="auth">
      <h1>{registro ? 'Crear cuenta' : 'Bienvenido de nuevo'}</h1>
      <Form form={form} layout="vertical" onFinish={enviar}>
        {registro && (
          <Form.Item name="name" label="Nombre">
            <Input />
          </Form.Item>
        )}
        <Form.Item
          name="email"
          label="Correo"
          rules={[{ required: true, type: 'email' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="Contraseña"
          rules={[{ required: true, min: 6 }]}
        >
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>
          {registro ? 'Registrarme' : 'Ingresar'}
        </Button>
      </Form>
      <Alert
        style={{ marginTop: 16 }}
        type="info"
        showIcon
        message="Acceso administrador"
        description="Pide al administrador que cree tu usuario o asigne el rol 'admin' en la base de datos."
      />
      <Link to={registro ? '/login' : '/registro'}>
        {registro ? 'Ya tengo una cuenta' : 'Crear una cuenta'}
      </Link>
    </Card>
  );
}