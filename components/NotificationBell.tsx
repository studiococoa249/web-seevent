"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function NotificationBell({ isMobile = false }: { isMobile?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) return;
        const userId = authData.user.id;

        // Fetch events created by the current user
        const { data: myEvents } = await supabase
          .from('event')
          .select('id')
          .eq('id_users', userId);
        
        const myEventIds = myEvents?.map((e: any) => e.id) || [];

        let pendingJoins: any[] = [];
        if (myEventIds.length > 0) {
          // Fetch users who want to join my events
          const { data: pending } = await supabase
            .from('event_participants')
            .select('id, status, event(title, id), users(nama_lengkap, profile(profile_url_imagekit))')
            .in('id_event', myEventIds)
            .eq('status', 'Pending');
            
          if (pending) {
            pendingJoins = pending.map((item: any) => ({
              id: item.id,
              type: 'pending_join',
              title: 'Ada yang ingin join!',
              message: `${item.users?.nama_lengkap || 'Seseorang'} ingin bergabung ke event "${item.event?.title}"`,
              eventId: item.event?.id,
              avatar: item.users?.profile?.profile_url_imagekit || 'https://i.pravatar.cc/150'
            }));
          }
        }

        // Fetch accepted joins for the current user
        const { data: accepted } = await supabase
          .from('event_participants')
          .select('id, status, event(title, id, users(profile(profile_url_imagekit)))')
          .eq('id_users', userId)
          .eq('status', 'Confirmed');

        let acceptedJoins: any[] = [];
        if (accepted) {
          acceptedJoins = accepted.map((item: any) => ({
            id: item.id,
            type: 'accepted_join',
            title: 'Request join diterima!',
            message: `Permintaanmu untuk bergabung ke event "${item.event?.title}" telah disetujui.`,
            eventId: item.event?.id,
            avatar: item.event?.users?.profile?.profile_url_imagekit || 'https://i.pravatar.cc/150?img=11'
          }));
        }

        // Combine and limit to 10 notifications
        const combined = [...pendingJoins, ...acceptedJoins].slice(0, 10);
        setNotifications(combined);
      } catch (err) {
        console.error('Error fetching notifications', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Setup interval to poll occasionally (every 1 minute)
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.length; // Currently assuming all are unread

  return (
    <div className={`relative ${isMobile ? 'flex flex-col items-center justify-center' : ''}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={isMobile 
          ? "flex flex-col items-center p-2 text-slate-400 hover:text-emerald-500 transition-colors relative" 
          : "text-slate-500 hover:text-emerald-600 transition-colors relative p-2"}
      >
        {isMobile ? (
          <>
            {unreadCount > 0 && <div className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></div>}
            <i className="fa-regular fa-bell text-xl mb-1"></i>
            <span className="text-[10px] font-medium">Notif</span>
          </>
        ) : (
          <>
            <i className="fa-regular fa-bell text-xl"></i>
            {unreadCount > 0 && <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></div>}
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute ${isMobile ? 'bottom-16 right-0 w-72 origin-bottom-right' : 'top-12 right-0 w-80 origin-top-right'} bg-white border border-slate-100 shadow-xl rounded-2xl z-50 overflow-hidden flex flex-col`}>
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Notifikasi</h3>
            {unreadCount > 0 && (
              <span className="bg-emerald-100 text-emerald-600 text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} Baru</span>
            )}
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
            {loading ? (
              <div className="p-6 text-center text-slate-400">
                <i className="fa-solid fa-circle-notch animate-spin text-emerald-500 text-2xl mb-2"></i>
                <p className="text-sm mt-2">Memuat...</p>
              </div>
            ) : notifications.length > 0 ? (
              <div className="flex flex-col">
                {notifications.map((notif, idx) => (
                  <a 
                    key={notif.id || idx} 
                    href={`/event/detail/${notif.eventId}`}
                    className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 items-start text-left"
                  >
                    <div className="relative flex-shrink-0 mt-1">
                      <img src={notif.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white ${notif.type === 'pending_join' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                        <i className={`fa-solid text-[8px] text-white ${notif.type === 'pending_join' ? 'fa-user-clock' : 'fa-check'}`}></i>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{notif.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 text-slate-300">
                  <i className="fa-regular fa-bell-slash text-xl"></i>
                </div>
                <p className="text-sm font-medium">Belum ada notifikasi</p>
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
              <button onClick={() => setNotifications([])} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                Bersihkan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
