import { supabase } from '../lib/supabase';
import { SpecialtyData, SpecialtyCategory, TopicItem, SPECIALTY_KNOWLEDGE } from '../constants/SpecialtyData';

export const dbService = {
  async getSpecialty(specialtyId: string): Promise<SpecialtyData | null> {
    const localSpec = SPECIALTY_KNOWLEDGE[specialtyId] || null;

    try {
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

      // Map categories and fallback empty categories to local knowledge
      const mappedCategories = categories.map((cat: any) => {
        const localCat = localSpec?.categories?.find((c) => c.id === cat.id);
        const remoteTopics = cat.topics && cat.topics.length > 0 ? cat.topics : null;

        const finalTopics: TopicItem[] = remoteTopics
          ? remoteTopics.map((t: any) => ({
              id: t.id,
              title: t.title,
              subtitle: t.subtitle,
              type: t.type,
              aiScopeDescription: t.ai_scope_description,
              clinicalContent: t.clinical_content,
            }))
          : localCat?.topics || [];

        return {
          id: cat.id,
          title: cat.title || localCat?.title || '',
          description: cat.description || localCat?.description || '',
          icon: (cat.icon as any) || localCat?.icon || 'book',
          topics: finalTopics,
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
        color: specialty.color || localSpec?.color || '#6ec2be',
        generalScope: specialty.general_scope || localSpec?.generalScope || '',
        illustration: localSpec?.illustration || null,
        categories: mappedCategories,
      };
    } catch (e) {
      console.warn('[dbService] getSpecialty network error, using local fallback:', e);
      return localSpec;
    }
  },

  async getCategory(specialtyId: string, categoryId: string): Promise<SpecialtyCategory | null> {
    const localCat = SPECIALTY_KNOWLEDGE[specialtyId]?.categories?.find((c) => c.id === categoryId) || null;

    try {
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

      const remoteTopics = cat.topics && cat.topics.length > 0 ? cat.topics : null;
      const finalTopics: TopicItem[] = remoteTopics
        ? remoteTopics.map((t: any) => ({
            id: t.id,
            title: t.title,
            subtitle: t.subtitle,
            type: t.type,
            aiScopeDescription: t.ai_scope_description,
            clinicalContent: t.clinical_content,
          }))
        : localCat?.topics || [];

      return {
        id: cat.id,
        title: cat.title || localCat?.title || '',
        description: cat.description || localCat?.description || '',
        icon: (cat.icon as any) || localCat?.icon || 'book',
        topics: finalTopics,
      };
    } catch (e) {
      console.warn('[dbService] getCategory network error, using local fallback:', e);
      return localCat;
    }
  },

  async getTopic(specialtyId: string, topicId: string): Promise<TopicItem | null> {
    const localTopic = SPECIALTY_KNOWLEDGE[specialtyId]?.categories
      ?.flatMap((c) => c.topics)
      ?.find((t) => t.id === topicId) || null;

    try {
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
    } catch (e) {
      console.warn('[dbService] getTopic network error, using local fallback:', e);
      return localTopic;
    }
  },
};
