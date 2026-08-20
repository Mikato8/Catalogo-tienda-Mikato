import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ROLES = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'admin', label: 'Administrador' },
];

function UsuarioForm({ form, editing, onFinish }) {
  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        name="email"
        label="Correo electrónico"
        rules={[
          { required: true, message: 'Ingresá el correo' },
          { type: 'email', message: 'Correo inválido' },
        ]}
      >
        <Input disabled={Boolean(editing)} />
      </Form.Item>
      <Form.Item
        name="name"
        label="Nombre"
        rules={[{ required: true, message: 'Ingresá el nombre' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="password"
        label={editing ? 'Nueva contraseña (opcional)' : 'Contraseña'}
        rules={
          editing
            ? [{ min: 6, message: 'Mínimo 6 caracteres' }]
            : [
              { required: true, message: 'Ingresá una contraseña' },
              { min: 6, message: 'Mínimo 6 caracteres' },
            ]
        }
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        name="role"
        label="Rol"
        rules={[{ required: true, message: 'Seleccioná el rol' }]}
      >
        <Select options={ROLES} />
      </Form.Item>
      <Button htmlType="submit" type="primary" block>
        {editing ? 'Guardar cambios' : 'Crear usuario'}
      </Button>
    </Form>
  );
}

export default function UsuariosAdmin() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const { token, usuario } = useAuth();
  const headers = useMemo(() => (
    token ? { Authorization: `Bearer ${token}` } : {}
  ), [token]);

  const cargar = useCallback(() => {
    api('/admin/users', { headers })
      .then((response) => setUsers(response.data || response))
      .catch(() => setUsers([]));
  }, [headers]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function nuevo() {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ role: 'cliente' });
    setOpen(true);
  }

  function editar(user) {
    setEditing(user);
    form.resetFields();
    form.setFieldsValue({
      email: user.email,
      name: user.full_name,
      role: user.role,
      password: '',
    });
    setOpen(true);
  }

  async function guardar(values) {
    try {
      if (editing) {
        const payload = {
          name: values.name,
          role: values.role,
        };
        if (values.password) {
          payload.password = values.password;
        }

        await api(`/admin/users/${editing.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(payload),
        });
        message.success('Usuario actualizado');
      } else {
        await api('/admin/users', {
          method: 'POST',
          headers,
          body: JSON.stringify(values),
        });
        message.success('Usuario creado');
      }
      setOpen(false);
      cargar();
    } catch (error) {
      message.error(error.message);
    }
  }

  function eliminar(user) {
    Modal.confirm({
      title: '¿Eliminar este usuario?',
      content: `Se eliminará «${user.email}».`,
      okText: 'Eliminar',
      cancelText: 'Cancelar',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api(`/admin/users/${user.id}`, {
            method: 'DELETE',
            headers,
          });
          message.success('Usuario eliminado');
          cargar();
        } catch (error) {
          message.error(error.message);
        }
      },
    });
  }

  return (
    <Card
      title="Usuarios"
      extra={<Button type="primary" onClick={nuevo}>Nuevo usuario</Button>}
    >
      <Table
        rowKey="id"
        dataSource={users}
        columns={[
          { title: 'Correo', dataIndex: 'email' },
          { title: 'Nombre', dataIndex: 'full_name' },
          {
            title: 'Rol',
            dataIndex: 'role',
            render: (value) => (
              <Tag color={value === 'admin' ? 'gold' : 'blue'}>{value}</Tag>
            ),
          },
          {
            title: 'Creado',
            dataIndex: 'created_at',
            render: (value) => new Date(value).toLocaleString('es-ES'),
          },
          {
            title: 'Acciones',
            render: (_, user) => (
              <Space>
                <Button onClick={() => editar(user)}>Editar</Button>
                <Button
                  danger
                  disabled={user.id === usuario?.id}
                  onClick={() => eliminar(user)}
                >
                  Eliminar
                </Button>
              </Space>
            ),
          },
        ]}
      />
      <Modal
        open={open}
        title={editing ? 'Editar usuario' : 'Nuevo usuario'}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        <UsuarioForm form={form} editing={editing} onFinish={guardar} />
      </Modal>
    </Card>
  );
}
