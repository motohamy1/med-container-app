import { supabase } from '../lib/supabase';
import {
  SpecialtyData,
  SpecialtyCategory,
  TopicItem,
  TopicSearchResult,
  SPECIALTY_KNOWLEDGE,
  getSpecialtyKnowledge,
  getCategoryKnowledge,
  getTopicKnowledge,
  synthesizeFallbackTopic,
} from '../constants/SpecialtyData';
import { Colors } from '../constants/Colors';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

const ALL_SPECIALTY_IDS = Object.keys(SPECIALTY_KNOWLEDGE);

function buildLocalSearchIndex(): TopicSearchResult[] {
  const index: TopicSearchResult[] = [];
  for (const specId of ALL_SPECIALTY_IDS) {
    const spec = SPECIALTY_KNOWLEDGE[specId];
    if (!spec) continue;
    for (const cat of spec.categories || []) {
      for (const topic of cat.topics || []) {
        index.push({
          ...topic,
          specialtyId: spec.id,
          specialtyName: spec.name,
          specialtyScientificName: spec.scientificName,
          specialtyColor: spec.color,
          specialtyIcon: spec.icon,
          categoryId: cat.id,
          categoryTitle: cat.title,
        });
      }
    }
  }
  return index;
}

const LOCAL_SEARCH_INDEX = buildLocalSearchIndex();

function scoreResult(q: string, r: TopicSearchResult): number {
  const title = r.title.toLowerCase();
  const subtitle = r.subtitle.toLowerCase();
  const type = (r.type || '').toLowerCase();
  const cat = (r.categoryTitle || '').toLowerCase();
  const spec = (r.specialtyScientificName || '').toLowerCase();
  if (title === q) return 100;
  if (title.startsWith(q)) return 80;
  if (title.includes(q)) return 60;
  if (subtitle.includes(q) || cat.includes(q) || type.includes(q) || spec.includes(q)) return 30;
  return 10;
}

const timeoutPromise = <T>(ms: number, fallbackValue: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(fallbackValue), ms));

export const dbService = {
  async getSpecialty(specialtyId: string): Promise<SpecialtyData> {
    const localSpec = getSpecialtyKnowledge(specialtyId);

    const remoteFetch = async (): Promise<SpecialtyData> => {
      const { data: specialty, error: specError } = await supabase
        .from('specialties')
        .select('*')
        .eq('id', specialtyId)
        .single();

      if (specError || !specialty) {
        return localSpec;
      }

      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select(`
          *,
          topics(id, title, subtitle, type, ai_scope_description, clinical_content)
        `)
        .eq('specialty_id', specialtyId);

      if (catError || !categories || categories.length === 0) {
        return localSpec;
      }

      // Map categories and merge remote + local topics
      const mappedCategories = categories.map((cat: any) => {
        const localCat = localSpec?.categories?.find((c) => c.id === cat.id);
        const remoteTopics: TopicItem[] = (cat.topics || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          subtitle: t.subtitle,
          type: t.type,
          aiScopeDescription: t.ai_scope_description,
          clinicalContent: t.clinical_content,
        }));

        const topicMap = new Map<string, TopicItem>();
        // Add local topics first
        localCat?.topics?.forEach((t) => topicMap.set(t.id, t));
        // Overwrite or add remote topics
        remoteTopics.forEach((t) => topicMap.set(t.id, t));

        return {
          id: cat.id,
          title: cat.title || localCat?.title || '',
          description: cat.description || localCat?.description || '',
          icon: (cat.icon as any) || localCat?.icon || 'book',
          topics: Array.from(topicMap.values()),
        };
      });

      // Also ensure any categories in localSpec that aren't in Supabase are included
      if (localSpec?.categories) {
        for (const lCat of localSpec.categories) {
          if (!mappedCategories.some((mc: SpecialtyCategory) => mc.id === lCat.id)) {
            mappedCategories.push(lCat);
          }
        }
      }

      return {
        id: specialty.id,
        name: specialty.name || localSpec?.name || '',
        scientificName: specialty.scientific_name || localSpec?.scientificName || '',
        icon: (specialty.icon as any) || localSpec?.icon || 'medical',
        color: localSpec?.color || specialty.color || Colors.main,
        generalScope: specialty.general_scope || localSpec?.generalScope || '',
        illustration: localSpec?.illustration || null,
        categories: mappedCategories,
      };
    };

    try {
      return await Promise.race([remoteFetch(), timeoutPromise(1200, localSpec)]);
    } catch {
      return localSpec;
    }
  },

  async getCategory(specialtyId: string, categoryId: string): Promise<SpecialtyCategory | null> {
    const localCat = getCategoryKnowledge(specialtyId, categoryId);

    const remoteFetch = async (): Promise<SpecialtyCategory | null> => {
      const { data: cat, error } = await supabase
        .from('categories')
        .select(`
          *,
          topics(id, title, subtitle, type, ai_scope_description, clinical_content)
        `)
        .eq('id', categoryId)
        .eq('specialty_id', specialtyId)
        .single();

      if (error || !cat) {
        return localCat;
      }

      const remoteTopics: TopicItem[] = (cat.topics || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        subtitle: t.subtitle,
        type: t.type,
        aiScopeDescription: t.ai_scope_description,
        clinicalContent: t.clinical_content,
      }));

      const topicMap = new Map<string, TopicItem>();
      localCat?.topics?.forEach((t) => topicMap.set(t.id, t));
      remoteTopics.forEach((t) => topicMap.set(t.id, t));

      return {
        id: cat.id,
        title: cat.title || localCat?.title || '',
        description: cat.description || localCat?.description || '',
        icon: (cat.icon as any) || localCat?.icon || 'book',
        topics: Array.from(topicMap.values()),
      };
    };

    try {
      return await Promise.race([remoteFetch(), timeoutPromise(1200, localCat)]);
    } catch {
      return localCat;
    }
  },

  async getTopic(specialtyId: string, topicId: string): Promise<TopicItem> {
    const { topic: localTopic } = getTopicKnowledge(specialtyId, topicId);

    const remoteFetch = async (): Promise<TopicItem> => {
      const { data: topic, error } = await supabase
        .from('topics')
        .select('*')
        .eq('id', topicId)
        .eq('specialty_id', specialtyId)
        .single();

      if (error || !topic) {
        return localTopic;
      }

      return {
        id: topic.id,
        title: topic.title || localTopic?.title || '',
        subtitle: topic.subtitle || localTopic?.subtitle || '',
        type: topic.type || localTopic?.type || '',
        aiScopeDescription: topic.ai_scope_description || localTopic?.aiScopeDescription || '',
        clinicalContent: topic.clinical_content || localTopic?.clinicalContent || [],
      };
    };

    try {
      return await Promise.race([remoteFetch(), timeoutPromise(1200, localTopic)]);
    } catch {
      return localTopic;
    }
  },

  async searchSpecialtyTopics(specialtyId: string, queryText: string): Promise<TopicItem[]> {
    const q = queryText.toLowerCase().trim();
    if (!q) return [];

    const spec = getSpecialtyKnowledge(specialtyId);
    const localTopics = (spec?.categories || [])
      .flatMap((c) => c.topics)
      .filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        t.clinicalContent?.some((s) => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q))
      );

    try {
      const res = await fetch(`${BACKEND_URL}/api/topics/search?specialtyId=${specialtyId}&q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const json = await res.json();
        const remoteTopics: TopicItem[] = (json.topics || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          subtitle: t.subtitle,
          type: t.type,
          aiScopeDescription: t.ai_scope_description,
          clinicalContent: t.clinical_content,
        }));

        const topicMap = new Map<string, TopicItem>();
        localTopics.forEach((t) => topicMap.set(t.id, t));
        remoteTopics.forEach((t) => topicMap.set(t.id, t));
        return Array.from(topicMap.values());
      }
    } catch {
      // Return local search results on network failure
    }

    return localTopics;
  },

  async searchAllTopics(queryText: string): Promise<TopicSearchResult[]> {
    const q = queryText.toLowerCase().trim();
    if (!q) return [];

    // Local instant search across the full SPECIALTY_KNOWLEDGE index
    const localResults = LOCAL_SEARCH_INDEX.map((r) => ({ r, score: scoreResult(q, r) }))
      .filter(({ r, score }) => score > 0 && (
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        (r.type || '').toLowerCase().includes(q) ||
        (r.categoryTitle || '').toLowerCase().includes(q) ||
        (r.specialtyScientificName || '').toLowerCase().includes(q) ||
        r.clinicalContent?.some((s) =>
          s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)
        )
      ))
      .sort((a, b) => b.score - a.score)
      .map(({ r }) => r);

    try {
      const res = await fetch(`${BACKEND_URL}/api/topics/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const json = await res.json();
        const remoteTopics: any[] = json.topics || [];

        // Map remote rows to TopicSearchResult, resolving specialty/category context
        const remoteResults: TopicSearchResult[] = [];
        for (const t of remoteTopics) {
          const specId = t.specialty_id as string | undefined;
          const catId = t.category_id as string | undefined;
          const spec = specId ? getSpecialtyKnowledge(specId) : undefined;
          const cat = spec?.categories?.find((c) => c.id === catId);

          // Skip remote rows that duplicate an existing local hit (same topic id)
          if (localResults.some((lr) => lr.id === t.id)) continue;

          remoteResults.push({
            id: t.id,
            title: t.title,
            subtitle: t.subtitle,
            type: t.type,
            aiScopeDescription: t.ai_scope_description,
            clinicalContent: t.clinical_content,
            specialtyId: specId || '',
            specialtyName: spec?.name || '',
            specialtyScientificName: spec?.scientificName || (specId || ''),
            specialtyColor: spec?.color || '#6ec2be',
            specialtyIcon: spec?.icon || ('medical' as any),
            categoryId: catId || '',
            categoryTitle: cat?.title || '',
          });
        }

        // Merge: local (already ranked) first, then remote additions
        return [...localResults, ...remoteResults].slice(0, 60);
      }
    } catch {
      // Return local search results on network failure
    }

    return localResults;
  },

  async synthesizeTopicFromReference(specialtyId: string, categoryId: string, query: string): Promise<TopicItem | null> {
    try {
      const res = await fetch(`${BACKEND_URL}/api/topics/synthesize-from-reference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialtyId, categoryId, query }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.topic) {
          return {
            id: data.topic.id,
            title: data.topic.title,
            subtitle: data.topic.subtitle,
            type: data.topic.type,
            aiScopeDescription: data.topic.ai_scope_description,
            clinicalContent: data.topic.clinical_content,
          };
        }
      }
    } catch (err) {
      console.warn('[dbService] synthesizeTopicFromReference failed:', err);
    }
    
    // Fallback synthesis on client
    return synthesizeFallbackTopic(specialtyId, query.toLowerCase().replace(/\s+/g, '_'), query);
  },

  async getDailyClinicalPearls(offset: number = 0, count: number = 5): Promise<import('../constants/DailyPearlsData').ClinicalPearl[]> {
    const { getDailyPearls } = await import('../constants/DailyPearlsData');
    try {
      const { data, error } = await supabase
        .from('clinical_pearls')
        .select('*')
        .limit(20);

      if (!error && data && data.length > 0) {
        const mapped = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          specialtyId: item.specialty_id,
          specialtyName: item.specialty_name,
          specialtyColor: item.specialty_color,
          specialtyIcon: item.specialty_icon,
          badge: item.badge || item.key_numbers || '',
          rule: item.rule || item.takeaway || item.pearl || '',
          action: item.action || '',
          pitfall: item.pitfall || '',
          citation: item.citation,
        }));
        const start = (offset * count) % mapped.length;
        const res: typeof mapped = [];
        for (let i = 0; i < count; i++) {
          res.push(mapped[(start + i) % mapped.length]);
        }
        return res;
      }
    } catch {
      // Fallback
    }

    return getDailyPearls(undefined, count, offset);
  },
};
