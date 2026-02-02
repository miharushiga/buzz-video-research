"""
FastAPIエントリーポイント - バズり動画究極リサーチシステム

アプリケーションの起動とルーティング設定
"""

import logging
import signal
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
from pythonjsonlogger import jsonlogger
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.middleware.base import BaseHTTPMiddleware

from app import __version__
from app.config import settings
from app.routers import (
    health_router,
    search_router,
    analyze_router,
    auth_router,
    subscription_router,
    webhook_router,
    admin_router,
)
from app.services import close_youtube_service


# ============================================
# 構造化ログ設定
# ============================================

class SensitiveDataFilter(logging.Filter):
    """機密情報マスキングフィルター"""

    def __init__(self):
        super().__init__()
        # マスキング対象のパターン（正規表現）
        import re
        self.patterns = [
            (re.compile(r'(api_key|apikey|key)=([^&\s]+)', re.I), r'\1=***MASKED***'),
            (re.compile(r'(token|access_token|refresh_token)=([^&\s]+)', re.I), r'\1=***MASKED***'),
            (re.compile(r'(password|passwd|pwd)=([^&\s]+)', re.I), r'\1=***MASKED***'),
            (re.compile(r'(authorization:\s*Bearer\s+)([^\s]+)', re.I), r'\1***MASKED***'),
            # YouTube API Keyの形式（AIzaSy で始まる39文字）
            (re.compile(r'AIzaSy[0-9A-Za-z_-]{33}'), r'AIzaSy***MASKED***'),
        ]

    def filter(self, record):
        """ログレコードの機密情報をマスキング"""
        if hasattr(record, 'msg') and isinstance(record.msg, str):
            for pattern, replacement in self.patterns:
                record.msg = pattern.sub(replacement, record.msg)
        return True


def setup_logging():
    """JSON形式の構造化ログを設定"""
    log_handler = logging.StreamHandler()
    formatter = jsonlogger.JsonFormatter(
        fmt='%(asctime)s %(levelname)s %(name)s %(message)s',
        datefmt='%Y-%m-%dT%H:%M:%S%z'
    )
    log_handler.setFormatter(formatter)

    # 機密情報マスキングフィルター追加
    sensitive_filter = SensitiveDataFilter()
    log_handler.addFilter(sensitive_filter)

    # ルートロガーに設定
    root_logger = logging.getLogger()
    root_logger.handlers = []
    root_logger.addHandler(log_handler)
    root_logger.setLevel(logging.INFO if not settings.is_development else logging.DEBUG)

    # uvicornのログも構造化
    for logger_name in ['uvicorn', 'uvicorn.error', 'uvicorn.access']:
        uvicorn_logger = logging.getLogger(logger_name)
        uvicorn_logger.handlers = []
        uvicorn_logger.addHandler(log_handler)


# 本番環境では構造化ログを使用
if not settings.is_development:
    setup_logging()

# ロガー設定
logger = logging.getLogger(__name__)


# ============================================
# レート制限設定
# ============================================

limiter = Limiter(key_func=get_remote_address)


# ============================================
# セキュリティヘッダーミドルウェア
# ============================================

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """セキュリティヘッダーを追加するミドルウェア"""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # セキュリティヘッダーを追加
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'

        # 本番環境ではHSTSを有効化
        if not settings.is_development:
            response.headers['Strict-Transport-Security'] = (
                'max-age=31536000; includeSubDomains'
            )

        # CSP（Content Security Policy）
        response.headers['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://www.paypal.com https://www.paypalobjects.com; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' https://i.ytimg.com https://www.paypalobjects.com https://lh3.googleusercontent.com data:; "
            "frame-src https://www.paypal.com https://www.sandbox.paypal.com; "
            "connect-src 'self' https://www.googleapis.com https://*.supabase.co https://api-m.paypal.com https://api-m.sandbox.paypal.com"
        )

        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    アプリケーションのライフサイクル管理

    - 起動時: 初期化処理
    - 終了時: グレースフルシャットダウン
    """
    # 起動時の処理
    logger.info(f'Starting バズり動画究極リサーチシステム v{__version__}')
    logger.info(f'Environment: {settings.node_env}')
    logger.info(f'CORS Origins: {settings.cors_origins}')

    yield

    # シャットダウン時の処理
    logger.info('Shutting down gracefully...')
    await close_youtube_service()


# FastAPIアプリケーション作成
app = FastAPI(
    title='バズり動画究極リサーチシステム API',
    description='YouTube動画のバズ度（影響力）を分析するAPIサービス',
    version=__version__,
    lifespan=lifespan,
    docs_url='/docs' if settings.is_development else None,
    redoc_url='/redoc' if settings.is_development else None,
)

# レート制限設定
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Prometheusメトリクス設定
Instrumentator().instrument(app).expose(app, endpoint='/metrics')

# セキュリティヘッダーミドルウェア追加
app.add_middleware(SecurityHeadersMiddleware)

# CORS設定（厳格化）
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=['GET', 'POST', 'OPTIONS'],
    allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
)


# ============================================
# グローバル例外ハンドラー
# ============================================

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    グローバル例外ハンドラー - 予期しないエラーをキャッチ

    Args:
        request: HTTPリクエスト
        exc: 発生した例外

    Returns:
        JSONResponse: エラーレスポンス
    """
    logger.exception(f'Unhandled exception: {exc}')

    return JSONResponse(
        status_code=500,
        content={
            'detail': '内部サーバーエラーが発生しました',
            'type': 'internal_error'
        }
    )


# ============================================
# グレースフルシャットダウン
# ============================================

def graceful_shutdown(signum, frame):
    """
    シグナル受信時のグレースフルシャットダウン処理

    Args:
        signum: シグナル番号
        frame: スタックフレーム
    """
    logger.info(f'Received signal {signum}, initiating graceful shutdown...')
    sys.exit(0)


# シグナルハンドラの登録
signal.signal(signal.SIGTERM, graceful_shutdown)
signal.signal(signal.SIGINT, graceful_shutdown)


# ============================================
# ルーター登録
# ============================================

app.include_router(health_router)
app.include_router(search_router)
app.include_router(analyze_router)
app.include_router(auth_router)
app.include_router(subscription_router)
app.include_router(webhook_router)
app.include_router(admin_router)


# ============================================
# ルートエンドポイント
# ============================================

@app.get(
    '/',
    tags=['Root'],
    summary='ルート',
    description='APIのルートエンドポイント'
)
async def root():
    """
    ルートエンドポイント

    Returns:
        dict: ウェルカムメッセージ
    """
    return {
        'message': 'バズり動画究極リサーチシステム API',
        'version': __version__,
        'docs': '/docs' if settings.is_development else None
    }


# ============================================
# アプリケーション起動
# ============================================

if __name__ == '__main__':
    import uvicorn

    uvicorn.run(
        'app.main:app',
        host='0.0.0.0',
        port=settings.backend_port,
        reload=settings.is_development
    )
