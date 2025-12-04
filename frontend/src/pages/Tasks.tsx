import React, { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Space,
  Tag,
  message,
  Typography,
  Row,
  Col,
  Statistic,
  Table,
  Modal,
  Form,
  Select,
  Input,
  Alert,
} from 'antd';
import {
  ClockCircleOutlined,
  SyncOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { tasksApi, agentsApi } from '../api';
import type { HealthCheck, Agent } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const Tasks: React.FC = () => {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [activeTasks, setActiveTasks] = useState<any[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [agentsData] = await Promise.all([agentsApi.getAll()]);
      setAgents(agentsData);

      try {
        const healthData = await tasksApi.checkHealth();
        setHealth(healthData);
      } catch {
        setHealth({ celery_status: 'unhealthy', workers_online: false });
      }

      try {
        const tasksData = await tasksApi.getActive();
        setActiveTasks(tasksData.active || []);
      } catch {
        setActiveTasks([]);
      }
    } catch (error) {
      console.error('Failed to load tasks data:', error);
    }
  };

  const handleTriggerGeneration = async (values: any) => {
    setTriggering(true);
    try {
      const result = await tasksApi.generatePost({
        agent_id: values.agent_id,
        topic: values.topic,
        keyword: values.keyword,
      });
      message.success(`Task started! Task ID: ${result.task_id}`);
      setModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Failed to trigger task');
    } finally {
      setTriggering(false);
    }
  };

  const handleRetryFailed = async () => {
    try {
      const result = await tasksApi.retryFailed();
      message.success(`Retrying ${result.triggered_count} failed publications`);
      loadData();
    } catch (error) {
      message.error('Failed to retry failed publications');
    }
  };

  const columns = [
    {
      title: 'Task Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => {
        const shortName = name.split('.').pop() || name;
        return <Text code>{shortName}</Text>;
      },
    },
    {
      title: 'Worker',
      dataIndex: 'worker',
      key: 'worker',
      render: (worker: string) => <Tag>{worker}</Tag>,
    },
    {
      title: 'Task ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Text type="secondary">{id.substring(0, 8)}...</Text>,
    },
  ];

  const isWorkerOnline = health?.workers_online === true;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <ClockCircleOutlined style={{ fontSize: 24 }} />
            <Title level={2} style={{ margin: 0 }}>
              Task Monitoring
            </Title>
          </Space>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadData}>
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
              disabled={!isWorkerOnline}
            >
              Trigger Generation
            </Button>
          </Space>
        </Space>
      </div>

      {!isWorkerOnline && (
        <Alert
          message="Celery Workers Offline"
          description="The Celery workers are currently offline. Tasks can be queued but will not execute until workers are started. Run: ./start_celery_worker.sh"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Worker Status"
              value={isWorkerOnline ? 'Online' : 'Offline'}
              prefix={isWorkerOnline ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              valueStyle={{ color: isWorkerOnline ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Tasks"
              value={activeTasks.length}
              prefix={<SyncOutlined spin={activeTasks.length > 0} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Celery Status"
              value={health?.celery_status || 'Unknown'}
              prefix={<ThunderboltOutlined />}
              valueStyle={{
                color: health?.celery_status === 'healthy' ? '#3f8600' : '#cf1322',
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Last Check"
              value={dayjs().format('HH:mm:ss')}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {health?.health_check_result && (
        <Card title="Health Check Details" style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Worker: </Text>
              <Text>{health.health_check_result.worker}</Text>
            </div>
            <div>
              <Text strong>Database: </Text>
              <Tag color="green">{health.health_check_result.database}</Tag>
            </div>
            <div>
              <Text strong>Timestamp: </Text>
              <Text>{dayjs(health.health_check_result.timestamp).format('YYYY-MM-DD HH:mm:ss')}</Text>
            </div>
          </Space>
        </Card>
      )}

      <Card
        title="Active Tasks"
        style={{ marginTop: 16 }}
        extra={
          <Button type="link" onClick={handleRetryFailed}>
            Retry Failed Publications
          </Button>
        }
      >
        {activeTasks.length > 0 ? (
          <Table
            columns={columns}
            dataSource={activeTasks}
            rowKey="id"
            pagination={false}
            size="small"
          />
        ) : (
          <Text type="secondary">No active tasks running</Text>
        )}
      </Card>

      <Card title="Quick Actions" style={{ marginTop: 16 }}>
        <Space wrap>
          <Button
            icon={<ThunderboltOutlined />}
            onClick={() => setModalVisible(true)}
            disabled={!isWorkerOnline}
          >
            Generate Post
          </Button>
          <Button
            icon={<SyncOutlined />}
            onClick={handleRetryFailed}
            disabled={!isWorkerOnline}
          >
            Retry Failed
          </Button>
          <Button icon={<ReloadOutlined />} onClick={loadData}>
            Refresh Status
          </Button>
        </Space>
      </Card>

      <Modal
        title="Trigger Post Generation"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={triggering}
      >
        <Form form={form} layout="vertical" onFinish={handleTriggerGeneration}>
          <Form.Item
            name="agent_id"
            label="Agent"
            rules={[{ required: true, message: 'Please select an agent' }]}
          >
            <Select placeholder="Select agent">
              {agents
                .filter((a) => a.is_active)
                .map((agent) => (
                  <Select.Option key={agent.id} value={agent.id}>
                    {agent.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item name="topic" label="Topic (Optional)">
            <Input placeholder="e.g., AI Trends 2025" />
          </Form.Item>

          <Form.Item name="keyword" label="Keyword (Optional)">
            <Input placeholder="e.g., artificial intelligence" />
          </Form.Item>

          <Alert
            message="Task will be queued and executed by Celery worker"
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        </Form>
      </Modal>
    </div>
  );
};
