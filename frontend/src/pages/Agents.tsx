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
import { PlusOutlined, EditOutlined, DeleteOutlined, RobotOutlined } from '@ant-design/icons';
import { agentsApi } from '../api';
import type { Agent, CreateAgentRequest } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const Agents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const data = await agentsApi.getAll();
      setAgents(data);
    } catch (error) {
      message.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAgent(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    form.setFieldsValue({
      ...agent,
      keywords: agent.keywords.join(', '),
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await agentsApi.delete(id);
      message.success('Agent deleted successfully');
      loadAgents();
    } catch (error) {
      message.error('Failed to delete agent');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateAgentRequest = {
        ...values,
        keywords: values.keywords.split(',').map((k: string) => k.trim()),
      };

      if (editingAgent) {
        await agentsApi.update(editingAgent.id, data);
        message.success('Agent updated successfully');
      } else {
        await agentsApi.create(data);
        message.success('Agent created successfully');
      }

      setModalVisible(false);
      loadAgents();
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
          <RobotOutlined />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Tone',
      dataIndex: 'tone_style',
      key: 'tone_style',
      render: (tone: string) => <Tag>{tone}</Tag>,
    },
    {
      title: 'SEO Focus',
      dataIndex: 'seo_focus',
      key: 'seo_focus',
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
      title: 'Schedule',
      dataIndex: 'schedule_cron',
      key: 'schedule_cron',
      render: (cron: string) => (cron ? <Tag color="blue">{cron}</Tag> : <Text type="secondary">-</Text>),
    },
    {
      title: 'Last Generation',
      dataIndex: 'last_generation',
      key: 'last_generation',
      render: (date: string) =>
        date ? dayjs(date).format('MMM D, YYYY HH:mm') : <Text type="secondary">Never</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Agent) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this agent?"
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
            <RobotOutlined />
            <Title level={3} style={{ margin: 0 }}>
              Agents
            </Title>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Create Agent
          </Button>
        }
      >
        <Table columns={columns} dataSource={agents} rowKey="id" loading={loading} />
      </Card>

      <Modal
        title={editingAgent ? 'Edit Agent' : 'Create Agent'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter agent name' }]}>
            <Input placeholder="e.g., Tech Blog Agent" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Brief description of this agent's purpose" />
          </Form.Item>

          <Form.Item
            name="tone_style"
            label="Tone & Style"
            rules={[{ required: true }]}
            initialValue="professional"
          >
            <Select>
              <Select.Option value="professional">Professional</Select.Option>
              <Select.Option value="casual">Casual</Select.Option>
              <Select.Option value="technical">Technical</Select.Option>
              <Select.Option value="friendly">Friendly</Select.Option>
              <Select.Option value="formal">Formal</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="keywords"
            label="Keywords"
            rules={[{ required: true }]}
            help="Comma-separated keywords (e.g., AI, machine learning, Python)"
          >
            <Input placeholder="AI, machine learning, Python" />
          </Form.Item>

          <Form.Item name="target_audience" label="Target Audience">
            <Input placeholder="e.g., Developers, Business professionals" />
          </Form.Item>

          <Form.Item
            name="seo_focus"
            label="SEO Focus"
            rules={[{ required: true }]}
            initialValue="balanced"
          >
            <Select>
              <Select.Option value="high">High - Maximum SEO optimization</Select.Option>
              <Select.Option value="balanced">Balanced - SEO with readability</Select.Option>
              <Select.Option value="readability">Readability - Focus on content quality</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="schedule_cron"
            label="Schedule (Cron)"
            help="e.g., '0 9 * * MON' for every Monday at 9 AM"
          >
            <Input placeholder="0 9 * * MON" />
          </Form.Item>

          <Form.Item name="is_active" label="Active" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
