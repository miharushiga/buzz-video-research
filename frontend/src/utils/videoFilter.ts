/**
 * 動画フィルタリングユーティリティ
 */
import type { Video, SearchFilters } from '../types';

/**
 * 期間フィルターをチェック
 */
const checkPeriodFilter = (video: Video, periodDays: number | null): boolean => {
  if (periodDays === null) return true;
  return video.daysAgo <= periodDays;
};

/**
 * 影響力フィルターをチェック
 */
const checkImpactFilter = (
  video: Video,
  impactMin: number | null,
  impactMax: number | null
): boolean => {
  if (impactMin !== null && video.impactRatio < impactMin) return false;
  if (impactMax !== null && video.impactRatio > impactMax) return false;
  return true;
};

/**
 * 登録者数フィルターをチェック
 */
const checkSubscriberFilter = (
  video: Video,
  subscriberMin: number | null,
  subscriberMax: number | null
): boolean => {
  if (subscriberMin !== null && video.subscriberCount < subscriberMin) return false;
  if (subscriberMax !== null && video.subscriberCount > subscriberMax) return false;
  return true;
};

/**
 * 動画リストをフィルタリング
 */
export const filterVideos = (videos: Video[], filters: SearchFilters): Video[] => {
  return videos.filter((video) => {
    const periodOk = checkPeriodFilter(video, filters.periodDays);
    const impactOk = checkImpactFilter(video, filters.impactMin, filters.impactMax);
    const subscriberOk = checkSubscriberFilter(video, filters.subscriberMin, filters.subscriberMax);
    return periodOk && impactOk && subscriberOk;
  });
};

/**
 * 動画リストをソート
 */
export const sortVideos = (
  videos: Video[],
  field: keyof Video,
  order: 'asc' | 'desc'
): Video[] => {
  return [...videos].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    if (field === 'publishedAt') {
      const aDate = new Date(aValue as string).getTime();
      const bDate = new Date(bValue as string).getTime();
      return order === 'desc' ? bDate - aDate : aDate - bDate;
    }

    const aNum = aValue as number;
    const bNum = bValue as number;
    return order === 'desc' ? bNum - aNum : aNum - bNum;
  });
};
