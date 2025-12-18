import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Popconfirm,
  message,
  Typography,
  Input,
  Select,
  Modal,
  Form,
  DatePicker,
} from 'antd';
import {
  FileTextOutlined,
  EyeOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { postsApi, publishersApi, tasksApi } from '../api';
import type { Post, Publisher } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;

export const Posts: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [postsData, publishersData] = await Promise.all([
        postsApi.getAll(),
        publishersApi.getAll(),
      ]);
      setPosts(postsData);
      setFilteredPosts(postsData);
      setPublishers(publishersData);
    } catch (error) {
      message.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(value.toLowerCase()) ||
        post.meta_description?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredPosts(filtered);
  };

  const handleFilterStatus = (status: string) => {
    if (status === 'all') {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter((post) => post.status === status));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await postsApi.delete(id);
      message.success('Post deleted successfully');
      loadData();
    } catch (error) {
      message.error('Failed to delete post');
    }
  };

  const handleSchedule = (post: Post) => {
    setSelectedPost(post);
    form.resetFields();
    setScheduleModalVisible(true);
  };

  const handlePublish = async (postId: string) => {
    try {
      await tasksApi.publishPost(postId);
      message.success('Post publishing task started');
      loadData();
    } catch (error) {
      message.error('Failed to start publishing task');
    }
  };

  const handleScheduleSubmit = async (values: any) => {
    if (!selectedPost) return;

    try {
      await postsApi.schedule(
        selectedPost.id,
        values.scheduled_at.toISOString(),
        values.publisher_id
      );
      message.success('Post scheduled successfully');
      setScheduleModalVisible(false);
      loadData();
    } catch (error) {
      message.error('Failed to schedule post');
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Post) => (
        <a onClick={() => navigate(`/posts/${record.id}`)}>
          <Text strong>{text}</Text>
        </a>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          published: 'green',
          scheduled: 'blue',
          draft: 'default',
          failed: 'red',
        };
        return <Tag color={colorMap[status] || 'default'}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Words',
      dataIndex: 'word_count',
      key: 'word_count',
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: 'Readability',
      dataIndex: 'readability_score',
      key: 'readability_score',
      render: (score: number) => {
        if (!score) return 'N/A';
        const color = score >= 80 ? 'green' : score >= 60 ? 'orange' : 'red';
        return <Tag color={color}>{score.toFixed(1)}</Tag>;
      },
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('MMM D, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Post) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/posts/${record.id}`)}
          >
            View
          </Button>
          {record.status === 'draft' && (
            <>
              <Button
                type="link"
                icon={<ClockCircleOutlined />}
                onClick={() => handleSchedule(record)}
              >
                Schedule
              </Button>
              <Button
                type="link"
                icon={<CloudUploadOutlined />}
                onClick={() => handlePublish(record.id)}
              >
                Publish
              </Button>
            </>
          )}
          <Popconfirm
            title="Are you sure you want to delete this post?"
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
            <FileTextOutlined />
            <Title level={3} style={{ margin: 0 }}>
              Posts
            </Title>
          </Space>
        }
      >
        <Space style={{ marginBottom: 16, width: '100%' }} wrap>
          <Search
            placeholder="Search posts..."
            onSearch={handleSearch}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            defaultValue="all"
            style={{ width: 150 }}
            onChange={handleFilterStatus}
            options={[
              { label: 'All Status', value: 'all' },
              { label: 'Draft', value: 'draft' },
              { label: 'Published', value: 'published' },
              { label: 'Scheduled', value: 'scheduled' },
              { label: 'Failed', value: 'failed' },
            ]}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={filteredPosts}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Schedule Post"
        open={scheduleModalVisible}
        onCancel={() => setScheduleModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleScheduleSubmit}>
          <Form.Item
            name="scheduled_at"
            label="Schedule Date & Time"
            rules={[{ required: true, message: 'Please select date and time' }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item name="publisher_id" label="Publisher (Optional)">
            <Select placeholder="Select publisher" allowClear>
              {publishers.map((pub) => (
                <Select.Option key={pub.id} value={pub.id}>
                  {pub.name} ({pub.publisher_type})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
