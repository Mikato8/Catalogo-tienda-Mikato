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
import { productosDemo } from '../../data/demo';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

function ProductoForm({ form, setFile, onFinish }) {
  const fields = ['name', 'sku', 'description', 'image_url', 'price', 'stock'];

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      {fields.map((field) => (
        <Form.Item
          key={field}
          name={field}
          label={field}
          rules={['name', 'price'].includes(field) ? [{ required: true }] : []}
        >
          <Input />
        </Form.Item>
      ))}
      <Form.Item label="Cargar imagen a Supabase Storage">
        <input
          type="file"
          accept="image/*"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />
      </Form.Item>
      <Button htmlType="submit" type="primary">
        Guardar producto
      </Button>
    </Form>
  );
}

export default function ProductosAdmin({ demo = false }) {
  const [items, setItems] = useState(demo ? productosDemo : []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [file, setFile] = useState(null);
  const [form] = Form.useForm();
  const { session } = useAuth();
  const headers = session
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};

  const cargar = useCallback(() => {
    if (!demo) {
      api('/products')
        .then((response) => setItems(response.data || response))
        .catch(() => setItems([]));
    }
  }, [demo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function nuevo() {
    setEditing(null);
    setFile(null);
    form.resetFields();
    setOpen(true);
  }

  function editar(item) {
    setEditing(item);
    setFile(null);
    form.setFieldsValue(item);
    setOpen(true);
  }

  async function guardar(values) {
    if (demo) {
      const next = {
        ...values,
        id: editing?.id || `demo-${Date.now()}`,
        price: Number(values.price),
        stock: Number(values.stock || 0),
        image_url: values.image_url || productosDemo[0].image_url,
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
      let imageUrl = values.image_url;

      if (file && supabase) {
        const path = `${Date.now()}-${file.name}`;
        const upload = await supabase.storage
          .from('product-images')
          .upload(path, file, { upsert: false });

        if (upload.error) {
          throw upload.error;
        }

        imageUrl = supabase.storage
          .from('product-images')
          .getPublicUrl(path).data.publicUrl;
      }

      await api(editing ? `/products/${editing.id}` : '/products', {
        method: editing ? 'PATCH' : 'POST',
        headers,
        body: JSON.stringify({
          ...values,
          image_url: imageUrl,
          price: Number(values.price),
          stock: Number(values.stock || 0),
        }),
      });
      message.success(editing ? 'Producto actualizado' : 'Producto creado');
      setOpen(false);
      cargar();
    } catch (error) {
      message.error(error.message);
    }
  }

  function eliminar(item) {
    Modal.confirm({
      title: '¿Eliminar este producto?',
      content: `Se eliminará «${item.name}».`,
      okText: 'Eliminar',
      cancelText: 'Cancelar',
      okButtonProps: { danger: true },
      onOk: async () => {
        if (demo) {
          setItems((current) => current.filter(({ id }) => id !== item.id));
        } else {
          await api(`/products/${item.id}`, {
            method: 'DELETE',
            headers,
          });
          cargar();
        }
        message.success('Producto eliminado');
      },
    });
  }

  return (
    <>
      <Card
        title="Productos"
        extra={<Button type="primary" onClick={nuevo}>Nuevo producto</Button>}
      >
        <Table
          rowKey="id"
          dataSource={items}
          columns={[
            { title: 'Producto', dataIndex: 'name' },
            { title: 'SKU', dataIndex: 'sku' },
            {
              title: 'Precio',
              dataIndex: 'price',
              render: (value) => `$${Number(value).toFixed(2)}`,
            },
            { title: 'Stock', dataIndex: 'stock' },
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
        title={editing ? 'Editar producto' : 'Nuevo producto'}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        <ProductoForm form={form} setFile={setFile} onFinish={guardar} />
      </Modal>
    </>
  );
}
