import type { IContentService, ContentListQuery, PostPage, EventPage } from "@/lib/domain";
import type { Result } from "@/lib/domain";
import { ok, err } from "@/lib/domain";
import {
  validationError,
  notFoundError,
  unknownError,
} from "@/lib/domain";
import type { Post, Event } from "@/lib/domain";
import { PostSchema, EventSchema } from "@/lib/domain";
import { posts, events } from "@/lib/domain";
import {
  getContentBookmarks,
  toggleContentBookmark,
} from "@/lib/domain";

function readSeedPosts(): Post[] {
  return (posts as Post[]).map((item) => {
    const validated = PostSchema.safeParse(item);
    if (validated.success) {
      return validated.data;
    }
    console.warn("Invalid post in seed:", item);
    return item as Post;
  });
}

function readSeedEvents(): Event[] {
  return (events as Event[]).map((item) => {
    const validated = EventSchema.safeParse(item);
    if (validated.success) {
      return validated.data;
    }
    console.warn("Invalid event in seed:", item);
    return item as Event;
  });
}

function mergePosts(seed: Post[], mutations: Post[]): Post[] {
  if (mutations.length === 0) {
    return seed;
  }
  
  const seedMap = new Map(seed.map((item) => [item.id, item]));
  mutations.forEach((mutated) => {
    seedMap.set(mutated.id, mutated);
  });
  
  return Array.from(seedMap.values());
}

function mergeEvents(seed: Event[], mutations: Event[]): Event[] {
  if (mutations.length === 0) {
    return seed;
  }
  
  const seedMap = new Map(seed.map((item) => [item.id, item]));
  mutations.forEach((mutated) => {
    seedMap.set(mutated.id, mutated);
  });
  
  return Array.from(seedMap.values());
}

function applyPagination<T>(
  items: T[],
  page: number,
  pageSize: number
): { items: T[]; total: number; page: number; limit: number; totalPages: number } {
  const total = items.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedItems = items.slice(start, end);
  
  return {
    items: paginatedItems,
    total,
    page,
    limit: pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export const contentServiceLocal: IContentService = {
  posts: {
    async listPosts(query?: ContentListQuery): Promise<Result<PostPage>> {
      try {
        const seed = readSeedPosts();
        const mutations: Post[] = []; // No storage mutations for now
        let posts = mergePosts(seed, mutations);
        
        if (query?.featured) {
          posts = posts.filter((post) => (post as any).featured);
        }
        
        if (query?.tag) {
          posts = posts.filter((post) => (post as any).tags?.includes(query.tag!));
        }
        
        const sorted = posts.sort(
          (a, b) =>
            new Date(b.publishedAt || "").getTime() - new Date(a.publishedAt || "").getTime()
        );
        
        const page = query?.page ?? 1;
        const pageSize = query?.pageSize ?? 10;
        const paginated = applyPagination(sorted, page, pageSize);
        
        const validated = paginated.items.map((item) => {
          const result = PostSchema.safeParse(item);
          if (result.success) {
            return result.data;
          }
          return item;
        });
        
        return ok({
          items: validated,
          total: paginated.total,
          page: paginated.page,
          limit: paginated.limit,
          totalPages: paginated.totalPages,
        });
      } catch (error) {
        return err(unknownError("Failed to list posts", error));
      }
    },

    async getPostBySlug(slug: string): Promise<Result<Post>> {
      try {
        const seed = readSeedPosts();
        const mutations: Post[] = [];
        const posts = mergePosts(seed, mutations);
        
        const post = posts.find((p) => p.slug === slug);
        
        if (!post) {
          return err(notFoundError(`Post not found: ${slug}`, "post"));
        }
        
        const validated = PostSchema.safeParse(post);
        if (!validated.success) {
          return err(validationError("Invalid post data", validated.error));
        }
        
        return ok(validated.data);
      } catch (error) {
        return err(unknownError("Failed to get post", error));
      }
    },
  },

  events: {
    async listEvents(upcoming?: boolean): Promise<Result<EventPage>> {
      try {
        const seed = readSeedEvents();
        const mutations: Event[] = [];
        let events = mergeEvents(seed, mutations);
        
        if (upcoming) {
          const now = new Date();
          events = events.filter((event) => new Date(event.date) >= now);
        }
        
        const sorted = events.sort(
          (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        const validated = sorted.map((item) => {
          const result = EventSchema.safeParse(item);
          if (result.success) {
            return result.data;
          }
          return item;
        });
        
        return ok({
          items: validated,
          total: validated.length,
          page: 1,
          limit: validated.length,
          totalPages: 1,
        });
      } catch (error) {
        return err(unknownError("Failed to list events", error));
      }
    },

    async getEventBySlug(slug: string): Promise<Result<Event>> {
      try {
        const seed = readSeedEvents();
        const mutations: Event[] = [];
        const events = mergeEvents(seed, mutations);
        
        const event = events.find((e) => e.slug === slug);
        
        if (!event) {
          return err(notFoundError(`Event not found: ${slug}`, "event"));
        }
        
        const validated = EventSchema.safeParse(event);
        if (!validated.success) {
          return err(validationError("Invalid event data", validated.error));
        }
        
        return ok(validated.data);
      } catch (error) {
        return err(unknownError("Failed to get event", error));
      }
    },
  },

  async toggleBookmark(contentId: string): Promise<Result<{ bookmarked: boolean }>> {
    try {
      toggleContentBookmark(contentId);
      const bookmarks = getContentBookmarks();
      const bookmarked = bookmarks.includes(contentId);
      
      return ok({ bookmarked });
    } catch (error) {
      return err(unknownError("Failed to toggle bookmark", error));
    }
  },

  async getBookmarks(): Promise<Result<string[]>> {
    try {
      const bookmarks = getContentBookmarks();
      return ok(bookmarks);
    } catch (error) {
      return err(unknownError("Failed to get bookmarks", error));
    }
  },
};

