import { Alert, Button, Card, Form, Input, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { configurado, supabase } from '../lib/supabase';

export default function Acceso({ registro = false }) {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  async function enviar(values) {
    if (!supabase) {
      message.warning('Configura las variables de Supabase para activar el acceso.');
      return;
    }

    const result = registro
      ? await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { data: { full_name: values.name } },
      })
      : await supabase.auth.signInWithPassword(values);

    if (result.error) {
      message.error(result.error.message);
    } else {
      navigate('/');
    }
  }

  return (
    <Card className="auth">
      <h1>{registro ? 'Crear cuenta' : 'Bienvenido de nuevo'}</h1>
      {!configurado && (
        <Alert
          message="Supabase no configurado"
          description="Copia frontend/.env.example a frontend/.env y completa tus credenciales."
          type="warning"
          showIcon
        />
      )}
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
        {!registro && (
          <Button
            block
            onClick={() => supabase?.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: window.location.origin },
            })}
          >
            Continuar con Google
          </Button>
        )}
      </Form>
      <Link to={registro ? '/login' : '/registro'}>
        {registro ? 'Ya tengo una cuenta' : 'Crear una cuenta'}
      </Link>
    </Card>
  );
}
