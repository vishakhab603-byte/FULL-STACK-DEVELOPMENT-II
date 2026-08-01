import { makeId } from '../utils/id';

/* ==========================================================================
   MOCK API — simulates a real backend: latency, occasional failures,
   and a persistent-for-the-session in-memory "database".
   ========================================================================== */

const LATENCY_RANGE = [280, 900];
const FAILURE_RATE = 0.08; // 8% of requests randomly fail, to exercise error/retry paths

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomLatency() {
  const [min, max] = LATENCY_RANGE;
  return Math.round(min + Math.random() * (max - min));
}

function maybeFail(context) {
  if (Math.random() < FAILURE_RATE) {
    const err = new Error(`Network blip while ${context}. Please retry.`);
    err.code = 'MOCK_NETWORK_ERROR';
    throw err;
  }
}

const PLATFORM_SEED = [
  { id: 'instagram', name: 'Instagram', color: '#E1306C', charLimit: 2200, icon: 'instagram' },
  { id: 'twitter', name: 'Twitter / X', color: '#1DA1F2', charLimit: 280, icon: 'twitter' },
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', charLimit: 3000, icon: 'linkedin' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2', charLimit: 63206, icon: 'facebook' },
  { id: 'threads', name: 'Threads', color: '#000000', charLimit: 500, icon: 'threads' }
];

const CAPTIONS = [
  'Shipping something new today. #buildinpublic',
  'Behind the scenes of our latest release 👀',
  'A small win worth celebrating this week.',
  'Here is what we learned launching v2.',
  'Design notes from this sprint 🎨',
  'Customer story: how a 3-person team scaled with us.',
  'Quick tip that will save you 10 minutes today.',
  'We are hiring — link in bio.',
  'Milestone unlocked: 10,000 users 🎉',
  'A candid look at our roadmap for next quarter.'
];

function seedPosts(count = 18) {
  const statuses = ['draft', 'published', 'scheduled', 'archived'];
  const posts = [];
  for (let i = 0; i < count; i += 1) {
    const platform = PLATFORM_SEED[i % PLATFORM_SEED.length];
    const status = statuses[i % statuses.length];
    const daysAgo = Math.floor(Math.random() * 20);
    const createdAt = new Date(Date.now() - daysAgo * 86400000).toISOString();
    posts.push({
      id: makeId('post'),
      title: CAPTIONS[i % CAPTIONS.length],
      content: `${CAPTIONS[i % CAPTIONS.length]} ${'#'.repeat(0)}#growth #product`,
      platformId: platform.id,
      status,
      isFavorite: Math.random() > 0.8,
      isPinned: Math.random() > 0.9,
      isArchived: status === 'archived',
      scheduledFor: status === 'scheduled' ? new Date(Date.now() + Math.random() * 5 * 86400000).toISOString() : null,
      createdAt,
      updatedAt: createdAt,
      publishedAt: status === 'published' ? createdAt : null,
      engagement: {
        likes: Math.floor(Math.random() * 900),
        comments: Math.floor(Math.random() * 120),
        shares: Math.floor(Math.random() * 60)
      }
    });
  }
  return posts;
}

// In-memory "database" — persists for the lifetime of the tab
const DB = {
  posts: seedPosts(),
  platforms: PLATFORM_SEED
};

export const mockApi = {
  async fetchPlatforms() {
    await wait(randomLatency());
    maybeFail('loading platforms');
    return DB.platforms.map((p) => ({ ...p }));
  },

  async fetchPosts() {
    await wait(randomLatency());
    maybeFail('loading posts');
    return DB.posts.map((p) => ({ ...p }));
  },

  async createPost(payload) {
    await wait(randomLatency());
    maybeFail('creating your post');
    const now = new Date().toISOString();
    const post = {
      id: makeId('post'),
      title: payload.title || 'Untitled post',
      content: payload.content || '',
      platformId: payload.platformId,
      status: payload.status || 'draft',
      isFavorite: false,
      isPinned: false,
      isArchived: false,
      scheduledFor: payload.scheduledFor || null,
      createdAt: now,
      updatedAt: now,
      publishedAt: payload.status === 'published' ? now : null,
      engagement: { likes: 0, comments: 0, shares: 0 }
    };
    DB.posts = [post, ...DB.posts];
    return post;
  },

  async updatePost(id, changes) {
    await wait(randomLatency());
    maybeFail('saving your changes');
    const idx = DB.posts.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Post not found');
    DB.posts[idx] = { ...DB.posts[idx], ...changes, updatedAt: new Date().toISOString() };
    return DB.posts[idx];
  },

  async deletePost(id) {
    await wait(randomLatency());
    maybeFail('deleting your post');
    DB.posts = DB.posts.filter((p) => p.id !== id);
    return id;
  },

  async publishPost(id) {
    await wait(randomLatency());
    maybeFail('publishing your post');
    const idx = DB.posts.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Post not found');
    const now = new Date().toISOString();
    DB.posts[idx] = { ...DB.posts[idx], status: 'published', publishedAt: now, updatedAt: now };
    return DB.posts[idx];
  }
};
