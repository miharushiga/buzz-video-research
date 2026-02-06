/**
 * 型定義 - バズり動画究極リサーチシステム
 * バックエンドと同期必須
 * 更新時は backend/app/schemas.py も同時更新すること
 */

// ============================================
// YouTube動画関連
// ============================================

/**
 * YouTube動画情報
 */
export interface Video {
  // 識別情報
  videoId: string;
  url: string;

  // 基本情報
  title: string;
  publishedAt: string; // ISO 8601形式
  thumbnailUrl: string;

  // 統計情報
  viewCount: number;
  likeCount: number;

  // チャンネル情報
  channelId: string;
  channelName: string;
  subscriberCount: number;
  channelCreatedAt: string; // ISO 8601形式

  // 計算値
  daysAgo: number;
  dailyAvgViews: number;
  impactRatio: number; // 影響力: viewCount / subscriberCount
  likeRatio: number; // 高評価率: likeCount / viewCount
}

/**
 * 検索フィルター条件
 */
export interface SearchFilters {
  periodDays: number | null; // 7, 30, 90, 365, null=全期間
  impactMin: number | null; // 影響力最小値
  impactMax: number | null; // 影響力最大値
  subscriberMin: number | null; // 登録者数最小値
  subscriberMax: number | null; // 登録者数最大値
}

/**
 * 検索リクエスト
 */
export interface SearchRequest {
  keyword: string;
  filters?: SearchFilters;
}

/**
 * 検索結果
 */
export interface SearchResult {
  keyword: string;
  searchedAt: string; // ISO 8601形式
  videos: Video[];
  searchesRemaining?: number; // 本日の残り検索回数
}

// ============================================
// バズ要因分析
// ============================================

/**
 * 検索キーワード提案
 */
export interface SuggestedKeyword {
  keyword: string;
  reason: string;
}

/**
 * バズ要因分析結果
 */
export interface AnalysisResult {
  videoId: string;
  buzzFactors: string;
  suggestedKeywords: SuggestedKeyword[];
  analysisSummary: string;
}

/**
 * 分析リクエスト
 */
export interface AnalyzeRequest {
  video: Video;
}

// ============================================
// 共通型
// ============================================

/**
 * APIエラーレスポンス
 */
export interface ApiError {
  detail: string;
}

/**
 * ソート条件
 */
export type SortField = 'impactRatio' | 'viewCount' | 'publishedAt' | 'dailyAvgViews';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

/**
 * 影響力レベル（バズ度）
 * 赤: 3倍以上（大バズ）
 * 黄: 1〜3倍（バズ）
 * 白: 1倍未満（通常）
 */
export type ImpactLevel = 'high' | 'medium' | 'low';

/**
 * 影響力レベルを判定する
 */
export const getImpactLevel = (impactRatio: number): ImpactLevel => {
  if (impactRatio >= 3.0) return 'high';
  if (impactRatio >= 1.0) return 'medium';
  return 'low';
};

// ============================================
// 型ガード関数
// ============================================

/**
 * Videoの型ガード
 */
export function isVideo(obj: unknown): obj is Video {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const video = obj as Record<string, unknown>;
  return (
    typeof video.videoId === 'string' &&
    typeof video.url === 'string' &&
    typeof video.title === 'string' &&
    typeof video.publishedAt === 'string' &&
    typeof video.thumbnailUrl === 'string' &&
    typeof video.viewCount === 'number' &&
    typeof video.likeCount === 'number' &&
    typeof video.channelId === 'string' &&
    typeof video.channelName === 'string' &&
    typeof video.subscriberCount === 'number' &&
    typeof video.channelCreatedAt === 'string' &&
    typeof video.daysAgo === 'number' &&
    typeof video.dailyAvgViews === 'number' &&
    typeof video.impactRatio === 'number' &&
    typeof video.likeRatio === 'number'
  );
}

// ============================================
// 認証・ユーザー関連
// ============================================

/**
 * ユーザープロファイル
 */
export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  isAdmin: boolean;
  createdAt?: string;
}

/**
 * サブスクリプション状態
 */
export type SubscriptionStatusType =
  | 'none'
  | 'trialing'
  | 'active'
  | 'cancelled'
  | 'expired'
  | 'past_due';

export interface SubscriptionStatus {
  status: SubscriptionStatusType;
  trialEnd?: string;
  currentPeriodEnd?: string;
  isActive: boolean;
  daysRemaining?: number;
}

/**
 * 認証レスポンス
 */
export interface AuthResponse {
  profile: UserProfile;
  subscription: SubscriptionStatus;
}

// ============================================
// 管理者関連
// ============================================

/**
 * ダッシュボード統計
 */
export interface DashboardStats {
  totalUsers: number;
  activeSubscribers: number;
  trialingUsers: number;
  monthlyRevenue: number;
  totalSearches: number;
  totalAnalyses: number;
  usersToday: number;
  searchesToday: number;
}

/**
 * ユーザー一覧アイテム
 */
export interface UserListItem {
  id: string;
  email: string;
  fullName?: string;
  isAdmin: boolean;
  createdAt: string;
  subscriptionStatus?: SubscriptionStatusType;
  trialEnd?: string;
  currentPeriodEnd?: string;
}

/**
 * アプリ設定
 */
export interface AppSettings {
  trialDays: number;
  monthlyPrice: number;
  adminEmail: string;
}
