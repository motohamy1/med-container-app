import { supabase } from '../lib/supabase';
import { SpecialtyData, SpecialtyCategory, TopicItem } from '../constants/SpecialtyData';

export const dbService = {
  async getSpecialty(specialtyId: string): Promise<SpecialtyData | null> {
    const { data: specialty, error: specError } = await supabase
      .from('specialties')
      .select('*')
      .eq('id', specialtyId)
      .single();

    if (specError || !specialty) {
      console.error('[dbService] getSpecialty error:', specError);
      return null;
    }

    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select(`
        *,
        topics(id, title, subtitle, type, ai_scope_description, clinical_content)
      `)
      .eq('specialty_id', specialtyId);

    if (catError) {
      console.error('[dbService] getSpecialty categories error:', catError);
      return null;
    }

    return {
      id: specialty.id,
      name: specialty.name,
      scientificName: specialty.scientific_name,
      icon: specialty.icon as any,
      color: specialty.color,
      generalScope: specialty.general_scope,
      illustration: null, // UI will fallback to local asset
      categories: (categories || []).map((cat: any) => ({
        id: cat.id,
        title: cat.title,
        description: cat.description,
        icon: cat.icon as any,
        topics: cat.topics || []
      }))
    };
  },

  async getCategory(specialtyId: string, categoryId: string): Promise<SpecialtyCategory | null> {
    const { data: cat, error } = await supabase
      .from('categories')
      .select(`
        *,
        topics(id, title, subtitle, type, ai_scope_description, clinical_content)
      `)
      .eq('id', categoryId)
      .eq('specialty_id', specialtyId)
      .single();

    if (error || !cat) return null;

    return {
      id: cat.id,
      title: cat.title,
      description: cat.description,
      icon: cat.icon as any,
      topics: cat.topics || []
    };
  },

  async getTopic(specialtyId: string, topicId: string): Promise<TopicItem | null> {
    const { data: topic, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', topicId)
      .eq('specialty_id', specialtyId)
      .single();

    if (error || !topic) return null;

    return {
      id: topic.id,
      title: topic.title,
      subtitle: topic.subtitle,
      type: topic.type,
      aiScopeDescription: topic.ai_scope_description,
      clinicalContent: topic.clinical_content
    };
  }
};
