# 📰 Blog Integration Guide

**Universal guide for connecting Auto-Blog SEO Monster to any blog platform**

This guide shows you how to configure publishers to automatically publish generated content to your blog, whether it's WordPress, Ghost, Next.js, custom CMS, or any other platform.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [WordPress Integration](#wordpress-integration)
3. [Ghost CMS Integration](#ghost-cms-integration)
4. [Static Site Generators (Next.js/Gatsby)](#static-site-generators)
5. [Custom CMS/API Integration](#custom-cmsapi-integration)
6. [Webflow Integration](#webflow-integration)
7. [Medium Integration](#medium-integration)
8. [Generic Webhook Integration](#generic-webhook-integration)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### How Publishing Works

```
┌────────────────────┐
│  Auto-Blog System  │
│   (Generate Post)  │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│   Publisher        │
│   Configuration    │
└─────────┬──────────┘
          │
          ├──> WordPress REST API
          ├──> Ghost Admin API
          ├──> Git Commit (Static Sites)
          ├──> Custom API
          └──> Webhook

```

### Publisher Configuration Schema

All publishers follow this pattern:

```json
{
  "name": "My Blog Publisher",
  "publisher_type": "wordpress|ghost|webhook|api",
  "config": {
    // Platform-specific configuration
  },
  "is_active": true
}
```

---

## 📱 WordPress Integration

### Option 1: Application Passwords (Recommended)

**Requirements:**
- WordPress 5.6+ or WordPress.com
- Application Passwords plugin (if self-hosted <5.6)

**Setup Steps:**

1. **Enable Application Passwords:**
   ```
   WordPress Admin → Users → Your Profile → Application Passwords
   ```

2. **Create Application Password:**
   - Name: "Auto-Blog SEO Monster"
   - Click "Add New Application Password"
   - **Save the password** (shows once): `xxxx xxxx xxxx xxxx`

3. **Test Credentials:**
   ```bash
   curl -X GET https://yourblog.com/wp-json/wp/v2/users/me \
     --user "username:xxxx xxxx xxxx xxxx"
   ```

4. **Configure Publisher:**

   Via Dashboard:
   ```
   Publishers → Create Publisher
   Name: My WordPress Blog
   Type: WordPress

   Configuration:
   - URL: https://yourblog.com
   - Username: your-username
   - Application Password: xxxx xxxx xxxx xxxx
   - Default Status: draft (or publish)
   - Default Category: Uncategorized
   ```

   Via API:
   ```bash
   curl -X POST http://localhost:8000/api/v1/publishers \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "agent_id": "YOUR_AGENT_ID",
       "name": "My WordPress Blog",
       "publisher_type": "wordpress",
       "config": {
         "url": "https://yourblog.com",
         "username": "your-username",
         "application_password": "xxxx xxxx xxxx xxxx",
         "default_status": "draft",
         "default_category": "Uncategorized"
       }
     }'
   ```

**Advanced Configuration:**

```json
{
  "url": "https://yourblog.com",
  "username": "admin",
  "application_password": "xxxx xxxx xxxx xxxx",

  "default_status": "draft",           // draft, publish, pending, private
  "default_category": "AI Content",    // Category name or ID
  "default_tags": ["AI", "SEO"],       // Array of tag names
  "default_author_id": 1,              // WordPress user ID

  "featured_image": true,              // Auto-generate featured image
  "excerpt_from_meta": true,           // Use meta_description as excerpt

  "custom_fields": {                   // Custom post meta
    "seo_score": "{{ post.seo_score }}",
    "ai_generated": "true"
  }
}
```

**Testing:**

```bash
# Test connection
curl -X POST http://localhost:8000/api/v1/publishers/test \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"publisher_id": "YOUR_PUBLISHER_ID"}'

# Expected response:
# {"success": true, "message": "WordPress connection successful"}
```

### Option 2: OAuth (WordPress.com)

For WordPress.com sites or Jetpack-enabled sites:

1. **Register OAuth App:**
   - Go to: https://developer.wordpress.com/apps/
   - Click "Create New Application"
   - Redirect URL: `https://yourapp.com/auth/wordpress/callback`
   - Save Client ID and Client Secret

2. **Configure Publisher:**
   ```json
   {
     "url": "https://public-api.wordpress.com",
     "site_id": "yourblog.wordpress.com",
     "oauth_client_id": "your-client-id",
     "oauth_client_secret": "your-client-secret",
     "oauth_redirect_uri": "https://yourapp.com/auth/wordpress/callback"
   }
   ```

3. **Implement OAuth Flow:**
   ```python
   # backend/app/services/publishers/wordpress_oauth.py
   async def get_authorization_url(self) -> str:
       params = {
           "client_id": self.oauth_client_id,
           "redirect_uri": self.oauth_redirect_uri,
           "response_type": "code"
       }
       return f"https://public-api.wordpress.com/oauth2/authorize?{urlencode(params)}"

   async def exchange_code_for_token(self, code: str) -> str:
       response = await self.client.post(
           "https://public-api.wordpress.com/oauth2/token",
           data={
               "client_id": self.oauth_client_id,
               "client_secret": self.oauth_client_secret,
               "code": code,
               "redirect_uri": self.oauth_redirect_uri,
               "grant_type": "authorization_code"
           }
       )
       return response.json()["access_token"]
   ```

### WordPress Custom Post Types

```json
{
  "url": "https://yourblog.com",
  "username": "admin",
  "application_password": "xxxx xxxx xxxx xxxx",

  "post_type": "tutorials",           // Custom post type
  "taxonomies": {
    "tutorial_category": "Python",    // Custom taxonomy
    "difficulty": "Beginner"
  }
}
```

---

## 👻 Ghost CMS Integration

**Requirements:**
- Ghost 4.0+ (self-hosted or Ghost Pro)
- Ghost Admin API key

**Setup Steps:**

1. **Create Custom Integration:**
   ```
   Ghost Admin → Settings → Integrations → Add Custom Integration
   Name: Auto-Blog SEO Monster
   ```

2. **Copy Admin API Key:**
   - Copy "Admin API Key" (starts with `GhostAdminAPIKey`)
   - Save API URL (e.g., `https://yourblog.com`)

3. **Configure Publisher:**

   ```json
   {
     "name": "My Ghost Blog",
     "publisher_type": "api",
     "config": {
       "url": "https://yourblog.com",
       "api_key": "YOUR_ADMIN_API_KEY",
       "api_version": "v5.0",

       "default_status": "draft",     // draft, published
       "default_authors": ["author-id"],
       "default_tags": ["AI", "Tutorial"],
       "visibility": "public",        // public, members, paid

       "send_email": false,           // Send to subscribers
       "featured": false              // Mark as featured
     }
   }
   ```

**Implementation:**

```python
# backend/app/services/publishers/ghost_publisher.py
import jwt
import datetime
from httpx import AsyncClient

class GhostPublisher:
    def __init__(self, config: dict):
        self.url = config["url"]
        self.api_key = config["api_key"]
        self.admin_url = f"{self.url}/ghost/api/admin"

    def generate_token(self) -> str:
        # Split key into ID and SECRET
        id, secret = self.api_key.split(':')

        # Create JWT token
        iat = int(datetime.datetime.now().timestamp())
        header = {'alg': 'HS256', 'typ': 'JWT', 'kid': id}
        payload = {
            'iat': iat,
            'exp': iat + 5 * 60,  # 5 minutes
            'aud': '/admin/'
        }

        return jwt.encode(payload, bytes.fromhex(secret), algorithm='HS256', headers=header)

    async def publish_post(self, post_data: dict) -> dict:
        token = self.generate_token()

        async with AsyncClient() as client:
            response = await client.post(
                f"{self.admin_url}/posts/",
                headers={
                    "Authorization": f"Ghost {token}",
                    "Content-Type": "application/json"
                },
                json={
                    "posts": [{
                        "title": post_data["title"],
                        "html": post_data["content"],
                        "status": self.config.get("default_status", "draft"),
                        "tags": [{"name": tag} for tag in self.config.get("default_tags", [])],
                        "meta_title": post_data.get("meta_title"),
                        "meta_description": post_data.get("meta_description"),
                        "feature_image": post_data.get("featured_image_url")
                    }]
                }
            )

            return response.json()["posts"][0]
```

**Testing:**

```bash
# Test Ghost API
curl -X GET https://yourblog.com/ghost/api/admin/posts/ \
  -H "Authorization: Ghost $(python generate_ghost_token.py)"
```

---

## 🏗️ Static Site Generators

### Next.js / Gatsby / Hugo Integration

**Strategy:** Commit markdown files to Git repository, trigger rebuild

**Option 1: Direct Git Push**

1. **Setup Git Repository:**
   ```bash
   git clone https://github.com/yourusername/your-blog.git
   cd your-blog
   ```

2. **Configure Publisher:**
   ```json
   {
     "name": "Next.js Blog via Git",
     "publisher_type": "webhook",
     "config": {
       "type": "git",
       "repo_url": "https://github.com/yourusername/your-blog.git",
       "branch": "main",
       "content_path": "content/posts",
       "git_username": "your-username",
       "git_token": "ghp_your_github_token",

       "commit_message": "Add post: {{ post.title }}",
       "trigger_build": true,
       "build_webhook": "https://api.vercel.com/v1/integrations/deploy/..."
     }
   }
   ```

3. **Implementation:**
   ```python
   # backend/app/services/publishers/git_publisher.py
   import git
   import os
   from datetime import datetime

   class GitPublisher:
       def __init__(self, config: dict):
           self.config = config
           self.repo_path = "/tmp/blog-repo"

       async def publish_post(self, post_data: dict) -> dict:
           # Clone or pull repo
           if not os.path.exists(self.repo_path):
               repo = git.Repo.clone_from(
                   self.config["repo_url"],
                   self.repo_path,
                   branch=self.config["branch"]
               )
           else:
               repo = git.Repo(self.repo_path)
               repo.remotes.origin.pull()

           # Create markdown file
           slug = post_data["slug"]
           date = datetime.now().strftime("%Y-%m-%d")
           filename = f"{date}-{slug}.md"
           filepath = os.path.join(
               self.repo_path,
               self.config["content_path"],
               filename
           )

           # Write frontmatter + content
           content = self._format_markdown(post_data)
           with open(filepath, 'w') as f:
               f.write(content)

           # Commit and push
           repo.index.add([filepath])
           repo.index.commit(self.config["commit_message"].replace("{{ post.title }}", post_data["title"]))
           repo.remotes.origin.push()

           # Trigger rebuild
           if self.config.get("trigger_build"):
               await self._trigger_build()

           return {"url": f"https://yourblog.com/posts/{slug}"}

       def _format_markdown(self, post_data: dict) -> str:
           return f"""---
title: {post_data['title']}
date: {datetime.now().isoformat()}
description: {post_data['meta_description']}
tags: {post_data['keywords']}
---

{post_data['content']}
"""

       async def _trigger_build(self):
           async with AsyncClient() as client:
               await client.post(self.config["build_webhook"])
   ```

**Option 2: GitHub API**

```python
from github import Github

class GitHubPublisher:
    def __init__(self, config: dict):
        self.gh = Github(config["github_token"])
        self.repo = self.gh.get_repo(config["repo_name"])

    async def publish_post(self, post_data: dict) -> dict:
        # Create file via GitHub API
        path = f"content/posts/{post_data['slug']}.md"
        content = self._format_markdown(post_data)

        self.repo.create_file(
            path=path,
            message=f"Add post: {post_data['title']}",
            content=content,
            branch="main"
        )

        return {"url": f"https://yourblog.com/posts/{post_data['slug']}"}
```

### Netlify/Vercel Auto-Deploy

```json
{
  "type": "git",
  "platform": "github",
  "repo": "username/repo",
  "github_token": "ghp_xxx",

  "deploy_platform": "vercel",
  "deploy_webhook": "https://api.vercel.com/v1/integrations/deploy/prj_xxx/xxx",
  "deploy_token": "xxx"
}
```

---

## 🔧 Custom CMS/API Integration

### Generic REST API Publisher

**For custom CMSs or APIs that accept JSON:**

```json
{
  "name": "Custom CMS",
  "publisher_type": "api",
  "config": {
    "url": "https://api.yourcms.com/v1/posts",
    "method": "POST",

    "auth_type": "bearer",           // bearer, basic, apikey, oauth
    "auth_token": "your-api-token",

    "headers": {
      "Content-Type": "application/json",
      "X-API-Key": "your-key"
    },

    "body_template": {
      "title": "{{ post.title }}",
      "content": "{{ post.content }}",
      "excerpt": "{{ post.meta_description }}",
      "status": "draft",
      "metadata": {
        "seo_score": "{{ post.seo_score }}",
        "keywords": "{{ post.keywords }}"
      }
    },

    "response_url_field": "data.url"  // Path to URL in response
  }
}
```

**Implementation:**

```python
# backend/app/services/publishers/api_publisher.py
import jinja2

class APIPublisher:
    def __init__(self, config: dict):
        self.config = config

    async def publish_post(self, post_data: dict) -> dict:
        # Render body template
        body = self._render_template(
            self.config["body_template"],
            post=post_data
        )

        # Prepare headers
        headers = self.config.get("headers", {})

        # Add authentication
        if self.config["auth_type"] == "bearer":
            headers["Authorization"] = f"Bearer {self.config['auth_token']}"
        elif self.config["auth_type"] == "basic":
            # Add basic auth
            pass

        # Make request
        async with AsyncClient() as client:
            response = await client.request(
                method=self.config["method"],
                url=self.config["url"],
                headers=headers,
                json=body
            )

            # Extract URL from response
            response_data = response.json()
            url = self._get_nested_value(
                response_data,
                self.config.get("response_url_field", "url")
            )

            return {"url": url, "response": response_data}

    def _render_template(self, template: dict, **context) -> dict:
        env = jinja2.Environment()

        def render_value(value):
            if isinstance(value, str):
                return env.from_string(value).render(context)
            elif isinstance(value, dict):
                return {k: render_value(v) for k, v in value.items()}
            elif isinstance(value, list):
                return [render_value(v) for v in value]
            return value

        return render_value(template)
```

### GraphQL API Publisher

```json
{
  "url": "https://api.yourcms.com/graphql",
  "auth_token": "your-token",

  "mutation": """
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        id
        url
      }
    }
  """,

  "variables_template": {
    "input": {
      "title": "{{ post.title }}",
      "content": "{{ post.content }}",
      "status": "DRAFT"
    }
  }
}
```

---

## 🎨 Webflow Integration

**Requirements:**
- Webflow site with CMS collections
- Webflow API access

**Setup:**

1. **Enable API Access:**
   ```
   Webflow Dashboard → Site Settings → Integrations → API Access
   Generate API Token
   ```

2. **Get Collection ID:**
   ```bash
   curl https://api.webflow.com/sites/{site_id}/collections \
     -H "Authorization: Bearer {api_token}"
   ```

3. **Configure Publisher:**
   ```json
   {
     "name": "Webflow Blog",
     "publisher_type": "api",
     "config": {
       "url": "https://api.webflow.com/collections/{collection_id}/items",
       "api_token": "your-api-token",
       "site_id": "your-site-id",
       "collection_id": "your-collection-id",

       "field_mappings": {
         "name": "{{ post.title }}",
         "slug": "{{ post.slug }}",
         "post-body": "{{ post.content }}",
         "thumbnail": "{{ post.featured_image_url }}",
         "_archived": false,
         "_draft": true
       }
     }
   }
   ```

**Implementation:**

```python
class WebflowPublisher:
    async def publish_post(self, post_data: dict) -> dict:
        fields = self._map_fields(post_data)

        async with AsyncClient() as client:
            response = await client.post(
                f"https://api.webflow.com/collections/{self.config['collection_id']}/items",
                headers={
                    "Authorization": f"Bearer {self.config['api_token']}",
                    "Content-Type": "application/json",
                    "accept-version": "1.0.0"
                },
                json={"fields": fields}
            )

            item = response.json()

            # Publish item
            if not fields.get("_draft"):
                await client.post(
                    f"https://api.webflow.com/collections/{self.config['collection_id']}/items/{item['_id']}/publish",
                    headers={"Authorization": f"Bearer {self.config['api_token']}"}
                )

            return {"url": f"https://yoursite.webflow.io/{item['slug']}"}
```

---

## 📝 Medium Integration

**⚠️ Note:** Medium official API is limited. Use for cross-posting only.

**Setup:**

1. **Get Integration Token:**
   ```
   Medium → Settings → Integration tokens
   Create token
   ```

2. **Configure Publisher:**
   ```json
   {
     "name": "Medium",
     "publisher_type": "api",
     "config": {
       "api_token": "your-medium-token",
       "url": "https://api.medium.com/v1/users/{user_id}/posts",

       "content_format": "markdown",  // or "html"
       "publish_status": "draft",     // draft, public, unlisted
       "license": "all-rights-reserved",
       "notify_followers": false,
       "canonical_url": "https://yourblog.com/posts/{{ post.slug }}"
     }
   }
   ```

**Implementation:**

```python
class MediumPublisher:
    async def publish_post(self, post_data: dict) -> dict:
        # Get user ID
        async with AsyncClient() as client:
            me_response = await client.get(
                "https://api.medium.com/v1/me",
                headers={"Authorization": f"Bearer {self.config['api_token']}"}
            )
            user_id = me_response.json()["data"]["id"]

            # Create post
            response = await client.post(
                f"https://api.medium.com/v1/users/{user_id}/posts",
                headers={
                    "Authorization": f"Bearer {self.config['api_token']}",
                    "Content-Type": "application/json"
                },
                json={
                    "title": post_data["title"],
                    "contentFormat": self.config["content_format"],
                    "content": post_data["content"],
                    "tags": post_data["keywords"][:5],  # Max 5 tags
                    "publishStatus": self.config["publish_status"],
                    "license": self.config["license"],
                    "canonicalUrl": self._render_canonical_url(post_data)
                }
            )

            return response.json()["data"]
```

---

## 🔗 Generic Webhook Integration

**For any platform with webhook support:**

```json
{
  "name": "Generic Webhook",
  "publisher_type": "webhook",
  "config": {
    "webhook_url": "https://yourapp.com/webhooks/new-post",
    "method": "POST",

    "headers": {
      "Content-Type": "application/json",
      "X-Webhook-Secret": "your-secret"
    },

    "payload_template": {
      "event": "post.created",
      "post": {
        "title": "{{ post.title }}",
        "content": "{{ post.content }}",
        "metadata": {
          "seo_score": {{ post.seo_score }},
          "word_count": {{ post.word_count }}
        }
      }
    },

    "retry_on_failure": true,
    "max_retries": 3,
    "retry_delay": 60  // seconds
  }
}
```

**Receiver Example (Your Blog's Webhook Endpoint):**

```python
# your-blog/api/webhooks.py
from fastapi import APIRouter, Request, HTTPException
import hmac
import hashlib

router = APIRouter()

@router.post("/webhooks/new-post")
async def receive_post(request: Request):
    # Verify webhook signature
    signature = request.headers.get("X-Webhook-Secret")
    if signature != "your-secret":
        raise HTTPException(status_code=401, detail="Invalid signature")

    # Process payload
    payload = await request.json()
    post_data = payload["post"]

    # Save to your CMS
    post = await create_post_in_your_cms(post_data)

    return {"success": True, "url": post.url}
```

---

## 🐛 Troubleshooting

### WordPress Issues

**Issue: 401 Unauthorized**
```
Solution:
1. Check application password is correct (copy-paste exactly)
2. Verify username matches WordPress user
3. Test with curl:
   curl https://yourblog.com/wp-json/wp/v2/users/me \
     --user "username:app-password"
```

**Issue: REST API disabled**
```
Solution:
1. Check .htaccess doesn't block /wp-json/
2. Verify WordPress version 5.6+
3. Try direct URL: https://yourblog.com/wp-json/wp/v2/posts
4. Disable security plugins temporarily
```

**Issue: SSL certificate error**
```
Solution:
1. Use HTTPS for WordPress URL
2. If self-signed cert:
   config["verify_ssl"] = false
```

### Ghost Issues

**Issue: Invalid JWT token**
```
Solution:
1. Check Admin API key format: id:secret
2. Verify token expiry (max 5 minutes)
3. Ensure using Admin API, not Content API
4. Test token generation:
   python -c "from ghost_publisher import GhostPublisher; print(GhostPublisher.generate_token())"
```

### Git Issues

**Issue: Authentication failed**
```
Solution:
1. Use Personal Access Token, not password
2. GitHub: Settings → Developer settings → PAT
3. Grant repo scope
4. Format: https://{token}@github.com/user/repo.git
```

**Issue: Merge conflicts**
```
Solution:
1. Pull before push in publisher code
2. Use unique filenames (timestamp + slug)
3. Set up branch protection to prevent conflicts
```

### API Issues

**Issue: CORS error**
```
Solution:
1. If custom API, add CORS headers:
   Access-Control-Allow-Origin: *
2. Use server-side publishing (never from browser)
3. Check API supports cross-origin requests
```

**Issue: Rate limiting**
```
Solution:
1. Add retry logic with exponential backoff
2. Implement queue system for bulk publishing
3. Check API rate limits:
   - WordPress: No limit (self-hosted)
   - Ghost: 500/hour
   - Medium: 60/hour
```

---

## 📚 Additional Resources

### WordPress
- REST API Docs: https://developer.wordpress.org/rest-api/
- Application Passwords: https://make.wordpress.org/core/2020/11/05/application-passwords/

### Ghost
- Admin API: https://ghost.org/docs/admin-api/
- Content API: https://ghost.org/docs/content-api/

### Webflow
- API Docs: https://developers.webflow.com/

### Medium
- API Docs: https://github.com/Medium/medium-api-docs

---

**Last Updated:** December 2024
**Version:** 1.0.0
