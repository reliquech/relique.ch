/**
 * @deprecated Use services from impl/ instead
 * This file is kept for backward compatibility during Phase 4 migration.
 */
import { contentService as contentServiceImpl } from "./impl";
import type { IContentService, ContentListParams } from "./contracts";
import type { Post, Event } from "@/lib/domain";

export const contentService: IContentService = {
  posts: {
    async list(params?: ContentListParams): Promise<Post[]> {
      const result = await contentServiceImpl.posts.listPosts({
        featured: params?.featured,
        tag: params?.tag,
        page: params?.page,
        pageSize: params?.pageSize,
      });
      
      if (result.ok) {
        return result.data.items;
      }
      
      console.error("Failed to list posts:", result.error);
      return [];
    },
    
    async get(slug: string): Promise<Post | null> {
      const result = await contentServiceImpl.posts.getPostBySlug(slug);
      if (result.ok) {
        return result.data;
      }
      return null;
    },
  },
  
  events: {
    async list(upcoming?: boolean): Promise<Event[]> {
      const result = await contentServiceImpl.events.listEvents(upcoming);
      if (result.ok) {
        return result.data.items;
      }
      
      console.error("Failed to list events:", result.error);
      return [];
    },
    
    async get(slug: string): Promise<Event | null> {
      const result = await contentServiceImpl.events.getEventBySlug(slug);
      if (result.ok) {
        return result.data;
      }
      return null;
    },
  },
};
