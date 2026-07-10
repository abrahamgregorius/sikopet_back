import { supabase } from '../../utils/db.js';

export class SettingsService {
  async getAll() {
    const { data, error } = await supabase.from('setting').select('*');
    if (error) throw new Error(error.message);
    return (data || []).reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
  }

  async get(key) {
    const { data, error } = await supabase
      .from('setting')
      .select('value')
      .eq('key', key)
      .single();

    if (error) return null;
    return data?.value;
  }

  async set(key, value) {
    const { data: existing } = await supabase
      .from('setting')
      .select('id')
      .eq('key', key)
      .single();

    if (existing) {
      const { data: updated, error } = await supabase
        .from('setting')
        .update({ value })
        .eq('key', key)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return updated;
    } else {
      const { data: created, error } = await supabase
        .from('setting')
        .insert({ key, value })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return created;
    }
  }
}

export const settingsService = new SettingsService();
