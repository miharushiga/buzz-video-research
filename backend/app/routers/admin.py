"""
管理者ルーター - バズ動画リサーチくん

管理者向けAPIエンドポイント
"""

from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel

from app.dependencies import require_admin
from app.core.security import UserInfo
from app.services.admin_service import (
    get_admin_service,
    AdminService,
    DashboardStats,
    UserListItem,
    UserDetail,
    AppSettings,
)


router = APIRouter(prefix='/api/admin', tags=['管理者'])


class UsersResponse(BaseModel):
    """ユーザー一覧レスポンス"""
    users: List[UserListItem]
    total: int
    page: int
    per_page: int


class UserUpdateRequest(BaseModel):
    """ユーザー更新リクエスト"""
    is_admin: Optional[bool] = None
    full_name: Optional[str] = None


@router.get('/dashboard', response_model=DashboardStats)
async def get_dashboard(
    user: UserInfo = Depends(require_admin),
    service: AdminService = Depends(get_admin_service)
):
    """
    ダッシュボード統計を取得

    Returns:
        DashboardStats: 統計情報
    """
    return await service.get_dashboard_stats()


@router.get('/users', response_model=UsersResponse)
async def get_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    user: UserInfo = Depends(require_admin),
    service: AdminService = Depends(get_admin_service)
):
    """
    ユーザー一覧を取得

    Args:
        page: ページ番号
        per_page: 1ページあたりの件数
        search: 検索クエリ
        status: ステータスフィルター

    Returns:
        UsersResponse: ユーザー一覧
    """
    users, total = await service.get_users(
        page=page,
        per_page=per_page,
        search=search,
        status_filter=status,
    )

    return UsersResponse(
        users=users,
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get('/users/{user_id}', response_model=UserDetail)
async def get_user_detail(
    user_id: str,
    user: UserInfo = Depends(require_admin),
    service: AdminService = Depends(get_admin_service)
):
    """
    ユーザー詳細を取得

    Args:
        user_id: ユーザーID

    Returns:
        UserDetail: ユーザー詳細
    """
    detail = await service.get_user_detail(user_id)

    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='ユーザーが見つかりません'
        )

    return detail


@router.put('/users/{user_id}')
async def update_user(
    user_id: str,
    request: UserUpdateRequest,
    user: UserInfo = Depends(require_admin),
    service: AdminService = Depends(get_admin_service)
):
    """
    ユーザー情報を更新

    Args:
        user_id: ユーザーID
        request: 更新内容

    Returns:
        dict: 結果
    """
    success = await service.update_user(
        user_id,
        is_admin=request.is_admin,
        full_name=request.full_name,
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='ユーザー情報の更新に失敗しました'
        )

    return {'success': True}


@router.get('/settings', response_model=AppSettings)
async def get_settings(
    user: UserInfo = Depends(require_admin),
    service: AdminService = Depends(get_admin_service)
):
    """
    アプリ設定を取得

    Returns:
        AppSettings: アプリ設定
    """
    return await service.get_settings()


@router.put('/settings')
async def update_settings(
    settings: AppSettings,
    user: UserInfo = Depends(require_admin),
    service: AdminService = Depends(get_admin_service)
):
    """
    アプリ設定を更新

    Args:
        settings: 更新する設定

    Returns:
        dict: 結果
    """
    success = await service.update_settings(settings)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='設定の更新に失敗しました'
        )

    return {'success': True}
