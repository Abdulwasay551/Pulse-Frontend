import { resourceApi } from "./api-resource";

export interface Announcement {
  id: number;
  message: string;
  created_at: string;
}

export interface AnnouncementWrite {
  message: string;
}

export const announcementsApi = resourceApi<Announcement, AnnouncementWrite>("/announcements/");
