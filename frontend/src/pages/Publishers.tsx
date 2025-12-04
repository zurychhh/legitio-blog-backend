import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Space,
  Tag,
  Popconfirm,
  message,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { publishersApi, agentsApi } from '../api';
import type { Publisher, CreatePublisherRequest, Agent } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const Publishers: React.FC = () => {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null);
  const [form] = Form.useForm();
  const [publisherType, setPublisherType] = useState<string>('wordpress');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [publishersData, agentsData] = await Promise.all([
        publishersApi.getAll(),
        agentsApi.getAll(),
      ]);
      setPublishers(publishersData);
      setAgents(agentsData);
    } catch (error) {
      message.error('Failed to load publishers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPublisher(null);
    form.resetFields();
    setPublisherType('wordpress');
    setModalVisible(true);
  };

  const handleEdit = (publisher: Publisher) => {
    setEditingPublisher(publisher);
    setPublisherType(publisher.publisher_type);
    form.setFieldsValue({
      agent_id: publisher.agent_id,
      name: publisher.name,
      publisher_type: publisher.publisher_type,
      is_active: publisher.is_active,
      ...publisher.config,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await publishersApi.delete(id);
      message.success('Publisher deleted successfully');
      loadData();
    } catch (error) {
      message.error('Failed to delete publisher');
    }
  };

  const handleTest = async (id: string) => {
    try {
      const result = await publishersApi.test(id);
      if (result.success) {
        message.success('Publisher connection successful!');
      } else {
        message.error(`Connection failed: ${result.message}`);
      }
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Connection test failed');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const config: Record<string, any> = {};

      if (publisherType === 'wordpress') {
        config.url = values.url;
        config.username = values.username;
        config.password = values.password;
        config.default_status = values.default_status || 'draft';
      } else if (publisherType === 'webhook') {
        config.url = values.webhook_url;
        config.method = values.method || 'POST';
        config.headers = values.headers ? JSON.parse(values.headers) : {};
      } else if (publisherType === 'api') {
        config.api_url = values.api_url;
        config.api_key = values.api_key;
        config.headers = values.api_headers ? JSON.parse(values.api_headers) : {};
      }

      const data: CreatePublisherRequest = {
        agent_id: values.agent_id,
        name: values.name,
        publisher_type: publisherType as any,
        config,
      };

      if (editingPublisher) {
        await publishersApi.update(editingPublisher.id, data);
        message.success('Publisher updated successfully');
      } else {
        await publishersApi.create(data);
        message.success('Publisher created successfully');
      }

      setModalVisible(false);
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <CloudUploadOutlined />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'publisher_type',
      key: 'publisher_type',
      render: (type: string) => <Tag color="purple">{type.toUpperCase()}</Tag>,
    },
    {
      title: 'Configuration',
      dataIndex: 'config',
      key: 'config',
      render: (config: Record<string, any>, record: Publisher) => {
        if (record.publisher_type === 'wordpress') {
          return <Text ellipsis style={{ maxWidth: 300 }}>{config.url}</Text>;
        } else if (record.publisher_type === 'webhook') {
          return (
            <Text ellipsis style={{ maxWidth: 300 }}>
              {config.url} ({config.method || 'POST'})
            </Text>
          );
        } else if (record.publisher_type === 'api') {
          return <Text ellipsis style={{ maxWidth: 300 }}>{config.api_url}</Text>;
        }
        return <Text type="secondary">-</Text>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'default'}>{active ? 'Active' : 'Inactive'}</Tag>
      ),
    },
    {
      title: 'Last Publish',
      dataIndex: 'last_publish',
      key: 'last_publish',
      render: (date: string) =>
        date ? dayjs(date).format('MMM D, YYYY HH:mm') : <Text type="secondary">Never</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Publisher) => (
        <Space>
          <Button
            type="link"
            icon={<CheckCircleOutlined />}
            onClick={() => handleTest(record.id)}
          >
            Test
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this publisher?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <CloudUploadOutlined />
            <Title level={3} style={{ margin: 0 }}>
              Publishers
            </Title>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Add Publisher
          </Button>
        }
      >
        <Table columns={columns} dataSource={publishers} rowKey="id" loading={loading} />
      </Card>

      <Modal
        title={editingPublisher ? 'Edit Publisher' : 'Add Publisher'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="agent_id"
            label="Agent"
            rules={[{ required: true, message: 'Please select an agent' }]}
          >
            <Select placeholder="Select agent">
              {agents.map((agent) => (
                <Select.Option key={agent.id} value={agent.id}>
                  {agent.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="e.g., My WordPress Blog" />
          </Form.Item>

          <Form.Item name="publisher_type" label="Publisher Type" rules={[{ required: true }]}>
            <Select onChange={setPublisherType} disabled={!!editingPublisher}>
              <Select.Option value="wordpress">WordPress</Select.Option>
              <Select.Option value="webhook">Webhook</Select.Option>
              <Select.Option value="api">API</Select.Option>
            </Select>
          </Form.Item>

          {publisherType === 'wordpress' && (
            <>
              <Form.Item name="url" label="WordPress URL" rules={[{ required: true, type: 'url' }]}>
                <Input placeholder="https://myblog.com" />
              </Form.Item>
              <Form.Item name="username" label="Username" rules={[{ required: true }]}>
                <Input placeholder="admin" />
              </Form.Item>
              <Form.Item name="password" label="Application Password" rules={[{ required: true }]}>
                <Input.Password placeholder="xxxx xxxx xxxx xxxx" />
              </Form.Item>
              <Form.Item name="default_status" label="Default Status" initialValue="draft">
                <Select>
                  <Select.Option value="draft">Draft</Select.Option>
                  <Select.Option value="publish">Publish</Select.Option>
                  <Select.Option value="pending">Pending Review</Select.Option>
                </Select>
              </Form.Item>
            </>
          )}

          {publisherType === 'webhook' && (
            <>
              <Form.Item
                name="webhook_url"
                label="Webhook URL"
                rules={[{ required: true, type: 'url' }]}
              >
                <Input placeholder="https://example.com/webhook" />
              </Form.Item>
              <Form.Item name="method" label="HTTP Method" initialValue="POST">
                <Select>
                  <Select.Option value="POST">POST</Select.Option>
                  <Select.Option value="PUT">PUT</Select.Option>
                  <Select.Option value="PATCH">PATCH</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="headers" label="Custom Headers (JSON)">
                <TextArea rows={3} placeholder='{"Authorization": "Bearer token"}' />
              </Form.Item>
            </>
          )}

          {publisherType === 'api' && (
            <>
              <Form.Item name="api_url" label="API URL" rules={[{ required: true, type: 'url' }]}>
                <Input placeholder="https://api.example.com/posts" />
              </Form.Item>
              <Form.Item name="api_key" label="API Key">
                <Input.Password placeholder="Your API key" />
              </Form.Item>
              <Form.Item name="api_headers" label="Custom Headers (JSON)">
                <TextArea rows={3} placeholder='{"Content-Type": "application/json"}' />
              </Form.Item>
            </>
          )}

          <Form.Item name="is_active" label="Active" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
