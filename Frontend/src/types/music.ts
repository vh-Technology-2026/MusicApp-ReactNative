export interface SongItem {
  id: string | number;
  title: string;
  artist: string;
  category: string;
  duration: string;
  coverUrl: string;
  videoKey?: string;
  videoUrl?: string;
  plays: string;
  isFavorite?: boolean;
}
