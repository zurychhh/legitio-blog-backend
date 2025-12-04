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
  ApiOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { sourcesApi, agentsApi } from '../api';
import type { Source, CreateSourceRequest, Agent } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const Sources: React.FC = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [form] = Form.useForm();
  const [sourceType, setSourceType] = useState<string>('rss');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sourcesData, agentsData] = await Promise.all([
        sourcesApi.getAll(),
        agentsApi.getAll(),
      ]);
      setSources(sourcesData);
      setAgents(agentsData);
    } catch (error) {
      message.error('Failed to load sources');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSource(null);
    form.resetFields();
    setSourceType('rss');
    setModalVisible(true);
  };

  const handleEdit = (source: Source) => {
    setEditingSource(source);
    setSourceType(source.source_type);
    form.setFieldsValue({
      agent_id: source.agent_id,
      name: source.name,
      source_type: source.source_type,
      is_active: source.is_active,
      ...source.config,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await sourcesApi.delete(id);
      message.success('Source deleted successfully');
      loadData();
    } catch (error) {
      message.error('Failed to delete source');
    }
  };

  const handleTest = async (id: string) => {
    try {
      const result = await sourcesApi.test(id);
      if (result.success) {
        message.success('Source connection successful!');
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

      if (sourceType === 'rss') {
        config.url = values.url;
        config.fetch_limit = values.fetch_limit || 10;
      } else if (sourceType === 'api') {
        config.api_url = values.api_url;
        config.api_key = values.api_key;
        config.headers = values.headers ? JSON.parse(values.headers) : {};
      }

      const data: CreateSourceRequest = {
        agent_id: values.agent_id,
        name: values.name,
        source_type: sourceType as any,
        config,
      };

      if (editingSource) {
        await sourcesApi.update(editingSource.id, data);
        message.success('Source updated successfully');
      } else {
        await sourcesApi.create(data);
        message.success('Source created successfully');
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
          <ApiOutlined />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'source_type',
      key: 'source_type',
      render: (type: string) => <Tag color="blue">{type.toUpperCase()}</Tag>,
    },
    {
      title: 'Configuration',
      dataIndex: 'config',
      key: 'config',
      render: (config: Record<string, any>, record: Source) => {
        if (record.source_type === 'rss') {
          return <Text ellipsis style={{ maxWidth: 300 }}>{config.url}</Text>;
        } else if (record.source_type === 'api') {
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
      title: 'Last Fetch',
      dataIndex: 'last_fetch',
      key: 'last_fetch',
      render: (date: string) =>
        date ? dayjs(date).format('MMM D, YYYY HH:mm') : <Text type="secondary">Never</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Source) => (
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
            title="Are you sure you want to delete this source?"
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
            <ApiOutlined />
            <Title level={3} style={{ margin: 0 }}>
              Sources
            </Title>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Add Source
          </Button>
        }
      >
        <Table columns={columns} dataSource={sources} rowKey="id" loading={loading} />
      </Card>

      <Modal
        title={editingSource ? 'Edit Source' : 'Add Source'}
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
            <Input placeholder="e.g., TechCrunch RSS Feed" />
          </Form.Item>

          <Form.Item name="source_type" label="Source Type" rules={[{ required: true }]}>
            <Select onChange={setSourceType} disabled={!!editingSource}>
              <Select.Option value="rss">RSS Feed</Select.Option>
              <Select.Option value="api">API</Select.Option>
              <Select.Option value="webhook">Webhook</Select.Option>
            </Select>
          </Form.Item>

          {sourceType === 'rss' && (
            <>
              <Form.Item name="url" label="RSS Feed URL" rules={[{ required: true, type: 'url' }]}>
                <Input placeholder="https://example.com/feed" />
              </Form.Item>
              <Form.Item name="fetch_limit" label="Fetch Limit" initialValue={10}>
                <Input type="number" min={1} max={50} />
              </Form.Item>
            </>
          )}

          {sourceType === 'api' && (
            <>
              <Form.Item name="api_url" label="API URL" rules={[{ required: true, type: 'url' }]}>
                <Input placeholder="https://api.example.com/content" />
              </Form.Item>
              <Form.Item name="api_key" label="API Key">
                <Input.Password placeholder="Optional API key" />
              </Form.Item>
              <Form.Item name="headers" label="Custom Headers (JSON)">
                <TextArea rows={3} placeholder='{"Authorization": "Bearer token"}' />
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
