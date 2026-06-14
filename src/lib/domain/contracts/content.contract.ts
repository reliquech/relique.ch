import type { Result } from "./result";
import type { ServiceError } from "./errors";
import type { Post, Event } from "../types/content";

/**
 * Content Service Contract
 */

export interface ContentListQuery {
  featured?: boolean;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export interface PostPage {
  items: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EventPage {
  items: Event[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IContentService {
  posts: {
    /**
     * List posts with query
     */
    listPosts(query?: ContentListQuery): Promise<Result<PostPage, ServiceError>>;

    /**
     * Get post by slug
     */
    getPostBySlug(slug: string): Promise<Result<Post, ServiceError>>;
  };

  events: {
    /**
     * List events (optionally filter upcoming)
     */
    listEvents(upcoming?: boolean): Promise<Result<EventPage, ServiceError>>;

    /**
     * Get event by slug
     */
    getEventBySlug(slug: string): Promise<Result<Event, ServiceError>>;
  };

  /**
   * Toggle bookmark for content (post or event)
   */
  toggleBookmark(contentId: string): Promise<Result<{ bookmarked: boolean }, ServiceError>>;

  /**
   * Get all bookmarked content IDs
   */
  getBookmarks(): Promise<Result<string[], ServiceError>>;
}

