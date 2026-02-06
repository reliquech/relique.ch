import type {
  IAdminMarketplaceService,
  IAdminContentService,
} from "./contracts";
import { marketplaceService } from "./marketplaceService";
import { contentService } from "./contentService";
import { storage } from "@/lib/storage";
import { MarketplaceListingSchema } from "@/lib/schemas/marketplace";
import { PostSchema, EventSchema } from "@/lib/schemas/content";
import type { MarketplaceListing } from "@/lib/schemas/marketplace";
import type { Post, Event } from "@/lib/schemas/content";

// Admin marketplace service with CRUD
const adminMarketplaceService: IAdminMarketplaceService = {
  ...marketplaceService,
  
  async create(
    listing: Omit<MarketplaceListing, "id" | "slug">
  ): Promise<MarketplaceListing> {
    const mutations = storage.marketplace.listings.get<MarketplaceListing>();
    const now = new Date().toISOString();
    const slug = listing.listing?.title
      ? listing.listing.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      : `listing-${Date.now()}`;

    const newListing: MarketplaceListing = {
      ...listing,
      id: `admin-${Date.now()}`,
      slug,
      state: {
        ...listing.state,
        created_at: listing.state?.created_at ?? now,
        updated_at: now,
        created_by: listing.state?.created_by ?? "admin",
      },
    };
    
    const validated = MarketplaceListingSchema.safeParse(newListing);
    if (!validated.success) {
      throw new Error("Invalid marketplace listing data");
    }
    
    mutations.push(validated.data);
    storage.marketplace.listings.set(mutations);
    
    return validated.data;
  },
  
  async update(
    id: string,
    updates: Partial<MarketplaceListing>
  ): Promise<MarketplaceListing | null> {
    const mutations = storage.marketplace.listings.get<MarketplaceListing>();
    const index = mutations.findIndex((item) => item.id === id);
    
    if (index === -1) return null;
    
    const existing = mutations[index];
    if (!existing) return null;
    
    const updated: MarketplaceListing = {
      ...existing,
      ...updates,
      state: {
        ...existing.state,
        ...updates.state,
        updated_at: new Date().toISOString(),
      },
    };
    
    const validated = MarketplaceListingSchema.safeParse(updated);
    if (!validated.success) {
      throw new Error("Invalid marketplace listing data");
    }
    
    mutations[index] = validated.data;
    storage.marketplace.listings.set(mutations);
    
    return validated.data;
  },
  
  async delete(id: string): Promise<boolean> {
    const mutations = storage.marketplace.listings.get<MarketplaceListing>();
    const filtered = mutations.filter((item) => item.id !== id);
    
    if (filtered.length === mutations.length) return false;
    
    storage.marketplace.listings.set(filtered);
    return true;
  },
  
  async bulkUpdate(
    ids: string[],
    updates: Partial<MarketplaceListing>
  ): Promise<number> {
    const mutations = storage.marketplace.listings.get<MarketplaceListing>();
    let updatedCount = 0;
    
    ids.forEach((id) => {
      const index = mutations.findIndex((item) => item.id === id);
      if (index !== -1 && mutations[index]) {
        mutations[index] = {
          ...mutations[index],
          ...updates,
          state: {
            ...mutations[index].state,
            ...updates.state,
            updated_at: new Date().toISOString(),
          },
        };
        updatedCount++;
      }
    });
    
    if (updatedCount > 0) {
      storage.marketplace.listings.set(mutations);
    }
    
    return updatedCount;
  },
  
  async bulkDelete(ids: string[]): Promise<number> {
    const mutations = storage.marketplace.listings.get<MarketplaceListing>();
    const filtered = mutations.filter((item) => !ids.includes(item.id));
    const deletedCount = mutations.length - filtered.length;
    
    if (deletedCount > 0) {
      storage.marketplace.listings.set(filtered);
    }
    
    return deletedCount;
  },
};

// Admin content service with CRUD
const adminContentService: IAdminContentService = {
  posts: {
    ...contentService.posts,
    
    async create(
      post: Omit<Post, "id" | "slug" | "createdAt" | "updatedAt">
    ): Promise<Post> {
      const mutations = storage.content.posts.get<Post>();
      const now = new Date().toISOString();
      
      const newPost = {
        ...post,
        id: `admin-post-${Date.now()}`,
        slug: post.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        createdAt: now,
        updatedAt: now,
      } as Post;
      
      const validated = PostSchema.safeParse(newPost);
      if (!validated.success) {
        throw new Error("Invalid post data");
      }
      
      mutations.push(validated.data);
      storage.content.posts.set(mutations);
      
      return validated.data;
    },
    
    async update(id: string, updates: Partial<Post>): Promise<Post | null> {
      const mutations = storage.content.posts.get<Post>();
      const index = mutations.findIndex((p) => p.id === id);
      
      if (index === -1) return null;
      
      const existing = mutations[index];
      if (!existing) return null;
      
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      } as Post;
      
      const validated = PostSchema.safeParse(updated);
      if (!validated.success) {
        throw new Error("Invalid post data");
      }
      
      mutations[index] = validated.data;
      storage.content.posts.set(mutations);
      
      return validated.data;
    },
    
    async delete(id: string): Promise<boolean> {
      const mutations = storage.content.posts.get<Post>();
      const filtered = mutations.filter((p) => p.id !== id);
      
      if (filtered.length === mutations.length) return false;
      
      storage.content.posts.set(filtered);
      return true;
    },
  },
  
  events: {
    ...contentService.events,
    
    async create(
      event: Omit<Event, "id" | "slug" | "createdAt" | "updatedAt">
    ): Promise<Event> {
      const mutations = storage.content.events.get<Event>();
      const now = new Date().toISOString();
      
      const newEvent = {
        ...event,
        id: `admin-event-${Date.now()}`,
        slug: event.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        createdAt: now,
        updatedAt: now,
      } as Event;
      
      const validated = EventSchema.safeParse(newEvent);
      if (!validated.success) {
        throw new Error("Invalid event data");
      }
      
      mutations.push(validated.data);
      storage.content.events.set(mutations);
      
      return validated.data;
    },
    
    async update(id: string, updates: Partial<Event>): Promise<Event | null> {
      const mutations = storage.content.events.get<Event>();
      const index = mutations.findIndex((e) => e.id === id);
      
      if (index === -1) return null;
      
      const existing = mutations[index];
      if (!existing) return null;
      
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      } as Event;
      
      const validated = EventSchema.safeParse(updated);
      if (!validated.success) {
        throw new Error("Invalid event data");
      }
      
      mutations[index] = validated.data;
      storage.content.events.set(mutations);
      
      return validated.data;
    },
    
    async delete(id: string): Promise<boolean> {
      const mutations = storage.content.events.get<Event>();
      const filtered = mutations.filter((e) => e.id !== id);
      
      if (filtered.length === mutations.length) return false;
      
      storage.content.events.set(filtered);
      return true;
    },
  },
};

export const adminService = {
  marketplace: adminMarketplaceService,
  content: adminContentService,
  
  getStats: async () => {
    const listings = await marketplaceService.list();
    const posts = await contentService.posts.list();
    const events = await contentService.events.list();
    const { consignService } = await import("./consignService");
    const submissions = await consignService.list("submitted");
    
    return {
      totalListings: listings.pageInfo.total,
      totalPosts: posts.length,
      totalEvents: events.length,
      totalSubmissions: submissions.length,
      recentListings: listings.items.slice(0, 5),
      recentPosts: posts.slice(0, 5),
      upcomingEvents: events.filter(
        (e) => new Date(e.date) >= new Date()
      ).slice(0, 5),
    };
  },
};
