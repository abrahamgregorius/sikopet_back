import { supabase } from '../../utils/db.js';

export class VehicleService {
  async list(user) {
    let query = supabase
      .from('vehicle')
      .select('*')
      .is('deletedAt', null);

    if (user.role !== 'pmo' && user.role !== 'admin') {
      query = query.eq('cooperativeId', user.cooperativeId);
    }

    const { data, error } = await query.order('plateNumber', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  }

  async create(user, data) {
    const { data: vehicle, error } = await supabase
      .from('vehicle')
      .insert({ ...data, cooperativeId: user.cooperativeId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return vehicle;
  }

  async update(id, data) {
    const { data: vehicle, error } = await supabase
      .from('vehicle')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return vehicle;
  }
}

export class DriverService {
  async list(user) {
    let query = supabase
      .from('driver')
      .select('*')
      .is('deletedAt', null);

    if (user.role !== 'pmo' && user.role !== 'admin') {
      query = query.eq('cooperativeId', user.cooperativeId);
    }

    const { data, error } = await query.order('name', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  }

  async create(user, data) {
    const { data: driver, error } = await supabase
      .from('driver')
      .insert({ ...data, cooperativeId: user.cooperativeId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return driver;
  }

  async update(id, data) {
    const { data: driver, error } = await supabase
      .from('driver')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return driver;
  }
}

export class DeliveryService {
  async list(user) {
    let query = supabase
      .from('deliverySchedule')
      .select('*, vehicle(*), driver(*), items(*, product(*))')
      .order('date', { ascending: false });

    if (user.role !== 'pmo' && user.role !== 'admin') {
      query = query.eq('vehicle.cooperativeId', user.cooperativeId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  async get(id) {
    const { data, error } = await supabase
      .from('deliverySchedule')
      .select('*, vehicle(*), driver(*), items(*, product(*)), appointments(*), positions(*), proof(*)')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async create(user, data) {
    const { data: delivery, error } = await supabase
      .from('deliverySchedule')
      .insert({
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        date: data.date || new Date().toISOString(),
        origin: data.origin,
        destination: data.destination,
        status: 'draft',
        items: data.items,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return delivery;
  }

  async update(id, data) {
    const { data: delivery, error } = await supabase
      .from('deliverySchedule')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return delivery;
  }

  async start(id) {
    const { data, error } = await supabase
      .from('deliverySchedule')
      .update({ status: 'in_progress' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async complete(id) {
    const { data, error } = await supabase
      .from('deliverySchedule')
      .update({ status: 'delivered' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async reschedule(id) {
    const { data, error } = await supabase
      .from('deliverySchedule')
      .update({ status: 'needs_reschedule' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getConflicts() {
    const { data, error } = await supabase
      .from('conflictCase')
      .select('*')
      .eq('conflictType', 'vehicle_overlap')
      .eq('status', 'open');

    if (error) throw new Error(error.message);
    return data || [];
  }

  async addTracking(id, data) {
    const { data: position, error } = await supabase
      .from('trackingPosition')
      .insert({
        deliveryScheduleId: id,
        latitude: data.latitude,
        longitude: data.longitude,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return position;
  }

  async addProof(id, data) {
    const { data: proof, error } = await supabase
      .from('proofOfDelivery')
      .insert({
        deliveryScheduleId: id,
        recipientName: data.recipientName,
        signatureUrl: data.signatureUrl,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return proof;
  }
}

export const vehicleService = new VehicleService();
export const driverService = new DriverService();
export const deliveryService = new DeliveryService();
