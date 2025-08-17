import { supabase } from "@/integrations/supabase/client";

export interface CreateInvoiceInput {
  org_id: string;
  guest_name: string;
  guest_email?: string;
  guest_phone?: string;
  guest_address?: string;
  reservation_id?: string;
  room_number?: string;
  room_type?: string;
  check_in_date?: string;
  check_out_date?: string;
  nights_count?: number;
  adults_count?: number;
  children_count?: number;
  reference?: string;
  due_date?: string;
  notes?: string;
  items: {
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
  }[];
}

export interface InvoiceWithItems {
  id: string;
  number: string;
  issue_date: string;
  due_date: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  guest_address?: string;
  reservation_id?: string;
  room_number?: string;
  room_type?: string;
  check_in_date?: string;
  check_out_date?: string;
  nights_count?: number;
  adults_count?: number;
  children_count?: number;
  reference?: string;
  notes?: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    total: number;
  }>;
}

export async function createInvoice(input: CreateInvoiceInput) {
  // For now, use simple invoice numbering until database function is created
  const invoiceNumber = `INV-${Date.now()}`;
  
  // Calculate totals
  const subtotal = input.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const taxAmount = input.items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unit_price;
    return sum + (itemTotal * item.tax_rate / 100);
  }, 0);
  const totalAmount = subtotal + taxAmount;

  // Since invoices and invoice_items tables don't exist yet in types, 
  // we'll use any for now and update when tables are added
  const { data: invoice, error: invoiceError } = await (supabase as any)
    .from('invoices')
    .insert({
      org_id: input.org_id,
      number: invoiceNumber,
      guest_name: input.guest_name,
      guest_email: input.guest_email || null,
      guest_phone: input.guest_phone || null,
      guest_address: input.guest_address || null,
      reservation_id: input.reservation_id || null,
      room_number: input.room_number || null,
      room_type: input.room_type || null,
      check_in_date: input.check_in_date || null,
      check_out_date: input.check_out_date || null,
      nights_count: input.nights_count || null,
      adults_count: input.adults_count || null,
      children_count: input.children_count || null,
      reference: input.reference || null,
      due_date: input.due_date || null,
      notes: input.notes || null,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      status: 'pending'
    })
    .select()
    .maybeSingle(); // SECURITY FIX: replaced .single() with .maybeSingle()

  if (invoiceError) throw invoiceError;

  // Create invoice items
  const { error: itemsError } = await (supabase as any)
    .from('invoice_items')
    .insert(
      input.items.map((item) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate,
        total: item.quantity * item.unit_price * (1 + item.tax_rate / 100)
      }))
    );

  if (itemsError) throw itemsError;

  return invoice;
}

export async function listInvoices(orgId: string, limit = 50) {
  const { data, error } = await (supabase as any)
    .from('invoices')
    .select('id, number, issue_date, due_date, status, total_amount, guest_name, created_at')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .range(0, limit - 1);

  if (error) throw error;
  return data;
}

export async function getInvoiceById(invoiceId: string): Promise<InvoiceWithItems> {
  const { data, error } = await (supabase as any)
    .from('invoices')
    .select(`
      id, number, issue_date, due_date, status, subtotal, tax_amount, total_amount,
      guest_name, guest_email, guest_phone, guest_address, reservation_id, room_number,
      room_type, check_in_date, check_out_date, nights_count, adults_count, children_count,
      reference, notes, created_at, updated_at,
      invoice_items (id, description, quantity, unit_price, tax_rate, total)
    `)
    .eq('id', invoiceId)
    .maybeSingle(); // SECURITY FIX: replaced .single() with .maybeSingle()

  if (error) throw error;
  return data;
}

export async function updateInvoiceStatus(invoiceId: string, status: string) {
  const { data, error } = await (supabase as any)
    .from('invoices')
    .update({ status })
    .eq('id', invoiceId)
    .select()
    .maybeSingle(); // SECURITY FIX: replaced .single() with .maybeSingle()

  if (error) throw error;
  return data;
}

export async function deleteInvoice(invoiceId: string) {
  // First delete items
  await (supabase as any)
    .from('invoice_items')
    .delete()
    .eq('invoice_id', invoiceId);

  // Then delete invoice
  const { error } = await (supabase as any)
    .from('invoices')
    .delete()
    .eq('id', invoiceId);

  if (error) throw error;
}