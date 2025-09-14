import { useState, useEffect } from 'react';

export type ServiceMode = 'direct' | 'table';

export type POSState =
  | { step: 'select-outlet' }
  | { step: 'open-session'; outletId: string }
  | { step: 'select-mode'; outletId: string; staffId?: string }
  | { step: 'direct-sale'; outletId: string; staffId: string; ticketId: string }
  | { step: 'table-sale'; outletId: string; staffId: string; tableId: string; ticketId: string };

type CreateTicketArgs =
  | { mode: 'direct'; staffId: string }
  | { mode: 'table'; staffId: string; tableId: string };

export function usePOSState() {
  const [state, setState] = useState<POSState>({ step: 'select-outlet' });

  const createTicket = (args: CreateTicketArgs) => {
    const ticketId = crypto.randomUUID();
    if (args.mode === 'direct') {
      setState(s => {
        if (s.step === 'select-mode' || s.step === 'direct-sale' || s.step === 'table-sale') {
          const outletId = 'outletId' in s ? s.outletId : '';
          return { step: 'direct-sale', outletId, staffId: args.staffId, ticketId };
        }
        return s;
      });
    } else {
      setState(s => {
        if (s.step === 'select-mode' || s.step === 'direct-sale' || s.step === 'table-sale') {
          const outletId = 'outletId' in s ? s.outletId : '';
          return { step: 'table-sale', outletId, staffId: args.staffId, tableId: args.tableId, ticketId };
        }
        return s;
      });
    }
  };

  const newOrderOnSameContext = () => {
    setState(s => {
      if (s.step === 'direct-sale') {
        return { ...s, ticketId: crypto.randomUUID() };
      }
      if (s.step === 'table-sale') {
        return { ...s, ticketId: crypto.randomUUID() };
      }
      return s;
    });
  };

  const setOutlet = (outletId: string) => setState({ step: 'open-session', outletId });
  
  const openSessionDone = () =>
    setState(s => (s.step === 'open-session' ? { step: 'select-mode', outletId: s.outletId } : s));

  const setMode = (mode: ServiceMode, staffId?: string) =>
    setState(s => (s.step === 'select-mode' ? { ...s, staffId } : s));

  const selectTableAndStart = (tableId: string, staffId: string) =>
    setState(s => (s.step === 'select-mode' ? { step: 'table-sale', outletId: s.outletId, staffId, tableId, ticketId: crypto.randomUUID() } : s));

  const startDirect = (staffId: string) =>
    setState(s => (s.step === 'select-mode' ? { step: 'direct-sale', outletId: s.outletId, staffId, ticketId: crypto.randomUUID() } : s));

  return {
    state,
    setOutlet,
    openSessionDone,
    setMode,
    createTicket,
    startDirect,
    selectTableAndStart,
    newOrderOnSameContext,
  };
}