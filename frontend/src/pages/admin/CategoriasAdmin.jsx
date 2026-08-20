import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Space,
  Table,
  message,
} from 'antd';
import { api } from '../../services/api';
import { categoriasDemo } from '../../data/demo';
import { useAuth } from '../../contexts/AuthContext';

export default function CategoriasAdmin({ demo = false }) {
  const [items, setItems] = useState(demo ? categoriasDemo : []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const { token } = useAuth();
  const headers = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const cargar = useCallback(() => {
    if (!demo) {
      api('/categories')
        .then((response) => setItems(response.data || response))
        .catch(() => setItems([]));
    }
  }, [demo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function editar(item) {
    setEditing(item);
    form.setFieldsValue(item);
    setOpen(true);
  }

  function nuevo() {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  }

  async function guardar(values) {
    if (demo) {
      const next = {
        ...values,
        id: editing?.id || `demo-${Date.now()}`,
        active: true,
      };
      setItems((current) => (
        editing
          ? current.map((item) => item.id === editing.id ? next : item)
          : [...current, next]
      ));
      setOpen(false);
      return;
    }

    try {
      await api(editing ? `/categories/${editing.id}` : '/categories', {
        method: editing ? 'PATCH' : 'POST',
        headers,
        body: JSON.stringify({ ...values, active: true }),
      });
      message.success(editing ? 'Categoría actualizada' : 'Categoría creada');
      setOpen(false);
      cargar();
    } catch (error) {
      message.error(error.message);
    }
  }

  function eliminar(item) {
    Modal.confirm({
      title: '¿Eliminar esta categoría?',
      content: `Se eliminará «${item.name}».`,
      okText: 'Eliminar',
      cancelText: 'Cancelar',
      okButtonProps: { danger: true },
      onOk: async () => {
        if (demo) {
          setItems((current) => current.filter(({ id }) => id !== item.id));
        } else {
          await api(`/categories/${item.id}`, {
            method: 'DELETE',
            headers,
          });
          cargar();
        }
        message.success('Categoría eliminada');
      },
    });
  }

  return (
    <>
      <Card
        title="Categorías"
        extra={<Button type="primary" onClick={nuevo}>Nueva categoría</Button>}
      >
        <Table
          rowKey="id"
          dataSource={items}
          columns={[
            { title: 'Nombre', dataIndex: 'name' },
            { title: 'Descripción', dataIndex: 'description' },
            {
              title: 'Acciones',
              render: (_, item) => (
                <Space>
                  <Button onClick={() => editar(item)}>Editar</Button>
                  <Button danger onClick={() => eliminar(item)}>Eliminar</Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>
      <Modal
        open={open}
        title={editing ? 'Editar categoría' : 'Nueva categoría'}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        <Form form={form} layout="vertical" onFinish={guardar}>
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Descripción">
            <Input.TextArea />
          </Form.Item>
          <Button htmlType="submit" type="primary">
            Guardar categoría
          </Button>
        </Form>
      </Modal>
    </>
  );
}
