import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Descriptions,
  Tabs,
  Input,
  Form,
  message,
  Row,
  Col,
  Statistic,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { postsApi } from '../api';
import type { Post } from '../types';
import ReactMarkdown from 'react-markdown';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (id) {
      loadPost(id);
    }
  }, [id]);

  const loadPost = async (postId: string) => {
    setLoading(true);
    try {
      const data = await postsApi.getById(postId);
      setPost(data);
      form.setFieldsValue(data);
    } catch (error) {
      message.error('Failed to load post');
      navigate('/posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    if (!post) return;

    setSaving(true);
    try {
      await postsApi.update(post.id, values);
      message.success('Post updated successfully');
      loadPost(post.id);
    } catch (error) {
      message.error('Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !post) {
    return <Card loading={loading}>Loading post...</Card>;
  }

  const statusColor = {
    published: 'green',
    scheduled: 'blue',
    draft: 'default',
    failed: 'red',
  }[post.status] || 'default';

  const tabItems = [
    {
      key: 'preview',
      label: 'Preview',
      children: (
        <Card>
          <article style={{ maxWidth: 800, margin: '0 auto' }}>
            <Title level={1}>{post.title}</Title>
            <Text type="secondary">{post.meta_description}</Text>
            <div style={{ marginTop: 24 }}>
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </article>
        </Card>
      ),
    },
    {
      key: 'edit',
      label: 'Edit',
      children: (
        <Card>
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item name="title" label="Title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="meta_title" label="Meta Title">
              <Input maxLength={60} showCount />
            </Form.Item>

            <Form.Item name="meta_description" label="Meta Description">
              <TextArea rows={2} maxLength={160} showCount />
            </Form.Item>

            <Form.Item name="content" label="Content (Markdown)" rules={[{ required: true }]}>
              <TextArea rows={20} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />}>
                Save Changes
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'seo',
      label: 'SEO Metrics',
      children: (
        <Card>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="SEO Score"
                value={post.seo_score.toFixed(1)}
                suffix="/ 100"
                valueStyle={{
                  color: post.seo_score >= 80 ? '#3f8600' : post.seo_score >= 60 ? '#faad14' : '#cf1322',
                }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Readability Score"
                value={post.readability_score.toFixed(1)}
                suffix="Flesch"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic title="Word Count" value={post.word_count.toLocaleString()} />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic title="Tokens Used" value={post.tokens_used.toLocaleString()} />
            </Col>
          </Row>

          <Descriptions title="SEO Details" bordered style={{ marginTop: 24 }}>
            <Descriptions.Item label="Meta Title" span={3}>
              {post.meta_title}
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Length: {post.meta_title.length}/60 characters
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Meta Description" span={3}>
              {post.meta_description}
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Length: {post.meta_description.length}/160 characters
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Cost" span={3}>
              ${post.cost_usd.toFixed(4)} USD
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ),
    },
    {
      key: 'details',
      label: 'Details',
      children: (
        <Card>
          <Descriptions bordered>
            <Descriptions.Item label="Post ID" span={3}>
              {post.id}
            </Descriptions.Item>
            <Descriptions.Item label="Agent ID" span={3}>
              {post.agent_id}
            </Descriptions.Item>
            <Descriptions.Item label="Status" span={3}>
              <Tag color={statusColor}>{post.status.toUpperCase()}</Tag>
            </Descriptions.Item>
            {post.published_url && (
              <Descriptions.Item label="Published URL" span={3}>
                <a href={post.published_url} target="_blank" rel="noopener noreferrer">
                  {post.published_url}
                </a>
              </Descriptions.Item>
            )}
            {post.scheduled_at && (
              <Descriptions.Item label="Scheduled At" span={3}>
                {dayjs(post.scheduled_at).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Created At" span={3}>
              {dayjs(post.created_at).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At" span={3}>
              {dayjs(post.updated_at).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/posts')}>
          Back to Posts
        </Button>
      </Space>

      <Card
        title={
          <Space>
            <Title level={3} style={{ margin: 0 }}>
              {post.title}
            </Title>
            <Tag color={statusColor}>{post.status.toUpperCase()}</Tag>
          </Space>
        }
      >
        <Tabs items={tabItems} defaultActiveKey="preview" />
      </Card>
    </div>
  );
};
