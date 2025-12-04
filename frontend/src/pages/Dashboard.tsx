import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Typography, Progress, Space, Button } from 'antd';
import {
  FileTextOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { postsApi, agentsApi, tenantsApi, tasksApi } from '../api';
import type { Post, Agent, Tenant, HealthCheck } from '../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [health, setHealth] = useState<HealthCheck | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [postsData, agentsData, tenantData] = await Promise.all([
        postsApi.getAll(),
        agentsApi.getAll(),
        tenantsApi.getCurrent(),
      ]);

      setPosts(postsData);
      setAgents(agentsData);
      setTenant(tenantData);

      // Try to get health (might fail if worker is down)
      try {
        const healthData = await tasksApi.checkHealth();
        setHealth(healthData);
      } catch {
        setHealth(null);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentPosts = posts.slice(0, 5);
  const postsThisMonth = posts.filter(
    (p) => dayjs(p.created_at).isAfter(dayjs().startOf('month'))
  ).length;

  const tokenUsagePercent = tenant
    ? Math.round((tenant.tokens_used / tenant.tokens_limit) * 100)
    : 0;
  const postsUsagePercent = tenant
    ? Math.round((tenant.posts_count / tenant.posts_limit) * 100)
    : 0;

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Post) => (
        <a onClick={() => navigate(`/posts/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color =
          status === 'published'
            ? 'green'
            : status === 'scheduled'
            ? 'blue'
            : status === 'failed'
            ? 'red'
            : 'default';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Words',
      dataIndex: 'word_count',
      key: 'word_count',
    },
    {
      title: 'SEO Score',
      dataIndex: 'seo_score',
      key: 'seo_score',
      render: (score: number) => `${score.toFixed(1)}`,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).fromNow(),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Dashboard</Title>
        <Text type="secondary">Welcome back! Here's an overview of your content generation system.</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Posts"
              value={posts.length}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Agents"
              value={agents.filter((a) => a.is_active).length}
              prefix={<RobotOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Posts This Month"
              value={postsThisMonth}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Celery Workers"
              value={health?.workers_online ? 'Online' : 'Offline'}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: health?.workers_online ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Token Usage">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>
                  {tenant?.tokens_used.toLocaleString()} / {tenant?.tokens_limit.toLocaleString()} tokens
                </Text>
                <Progress percent={tokenUsagePercent} status={tokenUsagePercent > 90 ? 'exception' : 'active'} />
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Posts Quota">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>
                  {tenant?.posts_count} / {tenant?.posts_limit} posts
                </Text>
                <Progress percent={postsUsagePercent} status={postsUsagePercent > 90 ? 'exception' : 'active'} />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card
        title="Recent Posts"
        style={{ marginTop: 16 }}
        extra={
          <Button type="link" onClick={() => navigate('/posts')}>
            View All
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={recentPosts}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
};
