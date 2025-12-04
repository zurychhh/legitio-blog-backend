"""
Posts API endpoints - manage blog posts with SEO metadata.
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.post import Post
from app.models.user import User
from app.models.agent import Agent
from app.models.publisher import Publisher
from app.schemas.post import (
    PostCreate,
    PostUpdate,
    PostResponse,
    PostListResponse,
    PostGenerateRequest,
    PostPublishRequest,
    PostScheduleRequest,
    SEOPreviewResponse
)
from app.api.deps import get_current_user
from app.ai.post_generator import get_post_generator
from app.services.seo_service import get_seo_service
from app.services.usage_service import get_usage_service
from app.ai.token_counter import get_token_counter
from app.adapters import create_publisher_adapter

router = APIRouter(prefix="/posts", tags=["Posts"])


@router.get("", response_model=PostListResponse)
async def list_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List posts with pagination."""
    # Build query based on user role
    query = select(Post)

    if not current_user.is_superadmin():
        # Filter by user's tenant through agents
        query = query.join(Agent).where(Agent.tenant_id == current_user.tenant_id)

    # Filter by status if provided
    if status:
        query = query.where(Post.status == status)

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Get paginated results
    query = query.order_by(Post.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    posts = result.scalars().all()

    return PostListResponse(
        items=posts,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size
    )


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get post by ID."""
    result = await db.execute(
        select(Post).where(Post.id == post_id)
    )
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    # Check access
    if not current_user.is_superadmin():
        # Get post's agent to check tenant
        agent_result = await db.execute(
            select(Agent).where(Agent.id == post.agent_id)
        )
        agent = agent_result.scalar_one_or_none()

        if not agent or agent.tenant_id != current_user.tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

    return post


@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: UUID,
    post_data: PostUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update post content and metadata."""
    result = await db.execute(
        select(Post).where(Post.id == post_id)
    )
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    # Check access
    if not current_user.is_superadmin():
        agent_result = await db.execute(
            select(Agent).where(Agent.id == post.agent_id)
        )
        agent = agent_result.scalar_one_or_none()

        if not agent or agent.tenant_id != current_user.tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

    # Update fields
    update_data = post_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(post, field, value)

    await db.commit()
    await db.refresh(post)

    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete post."""
    result = await db.execute(
        select(Post).where(Post.id == post_id)
    )
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    # Check access
    if not current_user.is_superadmin():
        agent_result = await db.execute(
            select(Agent).where(Agent.id == post.agent_id)
        )
        agent = agent_result.scalar_one_or_none()

        if not agent or agent.tenant_id != current_user.tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

    await db.delete(post)
    await db.commit()


@router.post("/generate", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def generate_post(
    generate_data: PostGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate blog post using AI.

    This endpoint:
    1. Checks tenant quotas (tokens and posts)
    2. Generates content using Claude API
    3. Calculates SEO metrics (readability, keyword density)
    4. Logs usage and updates tenant counters
    5. Saves post as draft
    """
    # Check agent exists and user has access
    result = await db.execute(
        select(Agent).where(Agent.id == generate_data.agent_id)
    )
    agent = result.scalar_one_or_none()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    if not current_user.is_superadmin() and agent.tenant_id != current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    # Check tenant quotas
    usage_service = get_usage_service()
    try:
        quota_status = await usage_service.check_tenant_quota(
            db=db,
            tenant_id=agent.tenant_id,
            tokens_needed=3000,  # Approximate tokens needed
            posts_needed=1,
        )

        if not quota_status["tokens_available"]:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Token limit exceeded. Remaining: {quota_status['tokens_remaining']}",
            )

        if not quota_status["posts_available"]:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Posts limit exceeded. Remaining: {quota_status['posts_remaining']}",
            )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    # Generate post using AI
    try:
        post_generator = get_post_generator()
        seo_service = get_seo_service()
        token_counter = get_token_counter()

        # Generate content
        generation_result = await post_generator.generate_post(
            agent=agent,
            topic=generate_data.topic,
            keyword=generate_data.target_keyword,
            sources_content=None,  # Will be added in Phase 3
        )

        # Calculate SEO metrics
        readability_score = seo_service.calculate_readability_score(
            generation_result["content"]
        )

        keyword_density = {}
        if generation_result["keywords"]:
            keyword_density = seo_service.calculate_keyword_density(
                generation_result["content"],
                generation_result["keywords"]
            )

        # Generate schema markup
        schema_markup = seo_service.generate_schema_markup(
            post_title=generation_result["title"],
            post_content=generation_result["content"],
            author_name=agent.name,
        )

        # Generate slug
        slug = seo_service.generate_slug(generation_result["title"])

        # Create post
        new_post = Post(
            agent_id=agent.id,
            title=generation_result["title"],
            content=generation_result["content"],
            meta_title=generation_result["meta_title"],
            meta_description=generation_result["meta_description"],
            keywords=generation_result["keywords"],
            slug=slug,
            status="draft",
            tokens_used=generation_result["tokens_used"],
            word_count=generation_result["word_count"],
            readability_score=readability_score,
            keyword_density=keyword_density,
        )

        db.add(new_post)
        await db.flush()

        # Estimate cost
        cost = token_counter.estimate_cost(
            input_tokens=generation_result["tokens_used"] // 2,  # Rough estimate
            output_tokens=generation_result["tokens_used"] // 2,
        )

        # Log usage
        await usage_service.log_usage(
            db=db,
            tenant_id=agent.tenant_id,
            action_type="post_generation",
            tokens_used=generation_result["tokens_used"],
            cost=cost,
            agent_id=agent.id,
            meta_data={
                "post_id": str(new_post.id),
                "user_id": str(current_user.id),
                "word_count": generation_result["word_count"],
                "readability_score": readability_score,
                "keyword_density": keyword_density,
            },
        )

        # Update tenant counters
        await usage_service.update_tenant_usage(
            db=db,
            tenant_id=agent.tenant_id,
            tokens_delta=generation_result["tokens_used"],
            posts_delta=1,
        )

        await db.commit()
        await db.refresh(new_post)

        return new_post

    except ValueError as e:
        # Quota exceeded during processing
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=str(e),
        )
    except Exception as e:
        # AI generation failed
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Post generation failed: {str(e)}",
        )


@router.post("/{post_id}/publish", status_code=status.HTTP_200_OK)
async def publish_post(
    post_id: UUID,
    publish_data: PostPublishRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Publish post to configured publisher.

    Uses publisher adapter to send post to target platform (WordPress, webhook, etc.).
    Updates post status and stores published URL.
    """
    # Get post
    result = await db.execute(
        select(Post).where(Post.id == post_id)
    )
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    # Get agent (for access check and publisher_id)
    agent_result = await db.execute(
        select(Agent).where(Agent.id == post.agent_id)
    )
    agent = agent_result.scalar_one_or_none()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    # Check access
    if not current_user.is_superadmin() and agent.tenant_id != current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    # Determine publisher to use
    publisher_id = publish_data.publisher_id or agent.publisher_id

    if not publisher_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No publisher specified. Set publisher_id in request or configure default publisher for agent.",
        )

    # Get publisher
    publisher_result = await db.execute(
        select(Publisher).where(Publisher.id == publisher_id)
    )
    publisher = publisher_result.scalar_one_or_none()

    if not publisher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publisher not found",
        )

    # Verify publisher belongs to same agent
    if publisher.agent_id != agent.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Publisher does not belong to this agent",
        )

    # Publish using adapter
    try:
        adapter = create_publisher_adapter(publisher.type, publisher.config)

        result = await adapter.publish(
            title=post.title,
            content=post.content,
            excerpt=post.excerpt,
            meta_title=post.meta_title,
            meta_description=post.meta_description,
            keywords=post.keywords,
            featured_image_url=post.og_image_url,
            status="publish",
        )

        if result.success:
            # Update post with publication details
            post.status = "published"
            post.published_url = result.published_url
            post.published_at = datetime.utcnow()
            post.publisher_id = publisher.id

            await db.commit()
            await db.refresh(post)

            return {
                "success": True,
                "message": "Post published successfully",
                "post_id": str(post_id),
                "published_url": result.published_url,
                "platform_post_id": result.published_id,
            }
        else:
            # Publication failed
            post.status = "failed"
            await db.commit()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Publication failed: {result.error}",
            )

    except ValueError as e:
        # Unknown adapter type
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Adapter error
        post.status = "failed"
        await db.commit()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Publication error: {str(e)}",
        )


@router.post("/{post_id}/schedule")
async def schedule_post(
    post_id: UUID,
    schedule_data: PostScheduleRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Schedule post for future publication."""
    result = await db.execute(
        select(Post).where(Post.id == post_id)
    )
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    # Check access
    if not current_user.is_superadmin():
        agent_result = await db.execute(
            select(Agent).where(Agent.id == post.agent_id)
        )
        agent = agent_result.scalar_one_or_none()

        if not agent or agent.tenant_id != current_user.tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

    post.status = "scheduled"
    post.scheduled_at = schedule_data.scheduled_at
    if schedule_data.publisher_id:
        post.publisher_id = schedule_data.publisher_id

    await db.commit()

    return {
        "message": "Post scheduled",
        "post_id": str(post_id),
        "scheduled_at": post.scheduled_at.isoformat()
    }
