"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@/lib/toast-context';

type TabName = 'general' | 'socials' | 'custom_code';

export default function SystemSettings() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabName>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // General Settings
  const [siteName, setSiteName] = useState('se-event');
  const [email, setEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [maxPostFree, setMaxPostFree] = useState(5);

  // Socials
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');

  // Custom code injection
  const [headHtml, setHeadHtml] = useState('');
  const [footerHtml, setFooterHtml] = useState('');

  // Upload States
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isLogo = type === 'logo';
    if (isLogo) setLogoUploading(true);
    else setFaviconUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'settings');

    try {
      const response = await fetch('/api/superadmin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal mengunggah file.');
      }

      const result = await response.json();
      if (isLogo) {
        setLogoUrl(result.url);
      } else {
        setFaviconUrl(result.url);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengunggah gambar.');
    } finally {
      if (isLogo) setLogoUploading(false);
      else setFaviconUploading(false);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/superadmin/setting');
        if (!response.ok) {
          throw new Error('Gagal memuat pengaturan.');
        }
        const data = await response.json();
        
        if (data.setting) {
          setSiteName(data.setting.site_name || 'se-event');
          setEmail(data.setting.email || '');
          setLogoUrl(data.setting.logo_url_imagekit || '');
          setFaviconUrl(data.setting.favicon_url_imagekit || '');
          setMaxPostFree(data.setting.max_post_free_membership ?? 5);
          setInstagram(data.setting.instagram_url || '');
          setFacebook(data.setting.facebook_url || '');
          
          // Parse injected code details
          const headJson = data.setting.head_code;
          const footerJson = data.setting.footer_code;
          setHeadHtml(headJson?.custom_code || '');
          setFooterHtml(footerJson?.custom_code || '');
        }


      } catch (err: any) {
        showToast(err.message || 'Koneksi gagal.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload = {
      setting: {
        site_name: siteName,
        email,
        logo_url_imagekit: logoUrl,
        favicon_url_imagekit: faviconUrl,
        max_post_free_membership: maxPostFree,
        instagram_url: instagram,
        facebook_url: facebook,
        // Save scripts inside standardized JSON structures
        head_code: { custom_code: headHtml },
        footer_code: { custom_code: footerHtml },
      },
      imagekit: null,
    };

    try {
      const response = await fetch('/api/superadmin/setting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menyimpan pengaturan.');
      }

      showToast('Pengaturan sistem berhasil disimpan dan diterapkan!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan sistem.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { name: string; id: TabName; icon: string }[] = [
    { name: 'Umum & Tampilan', id: 'general', icon: 'fa-solid fa-desktop' },
    { name: 'Sosial Media', id: 'socials', icon: 'fa-solid fa-share-nodes' },
    { name: 'Kode Pelacak (Head/Footer)', id: 'custom_code', icon: 'fa-solid fa-code' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pengaturan Sistem</h1>
        <p className="text-slate-400 text-xs mt-1">
          Konfigurasi nama situs, API penyimpanan gambar, tautan sosial, dan custom script injection.
        </p>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <i className="fa-solid fa-circle-notch animate-spin text-3xl text-emerald-600"></i>
          <span className="text-sm font-medium">Memuat konfigurasi sistem...</span>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Vertical Tabs Sidebar */}
          <div className="w-full md:w-64 shrink-0 bg-white p-3 rounded-3xl border border-slate-100 shadow-sm space-y-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50'
                      : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-50'
                  }`}
                >
                  <i className={`${tab.icon} text-sm shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}></i>
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content Card */}
          <div className="flex-1 w-full bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tab 1: General */}
              {activeTab === 'general' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">
                      Pengaturan Umum & Tampilan
                    </h3>
                  </div>

                  {/* Site Name & Contact Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Situs / Website</label>
                      <input
                        type="text"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-semibold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Kontak Resmi</label>
                      <input
                        type="email"
                        placeholder="admin@seevent.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-medium"
                      />
                    </div>
                  </div>

                  {/* Logo & Favicon Urls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Logo Upload Block */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Logo Website</label>
                      <div className="border border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        {logoUrl ? (
                          <div className="mb-3 relative group">
                            <img src={logoUrl} alt="Logo Preview" className="h-12 object-contain rounded-lg border border-slate-100 bg-white p-1" />
                            <button
                              type="button"
                              onClick={() => setLogoUrl('')}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center shadow hover:bg-red-600"
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                            <i className="fa-solid fa-image text-lg"></i>
                          </div>
                        )}

                        <div className="text-center">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-emerald-600 rounded-xl text-xs font-semibold transition-all">
                            {logoUploading ? (
                              <>
                                <i className="fa-solid fa-circle-notch animate-spin text-emerald-600"></i>
                                Mengunggah...
                              </>
                            ) : (
                              <>
                                <i className="fa-solid fa-cloud-arrow-up"></i>
                                {logoUrl ? 'Ganti Logo' : 'Pilih Logo'}
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleUpload(e, 'logo')}
                              disabled={logoUploading}
                              className="hidden"
                            />
                          </label>
                          <p className="text-[10px] text-slate-400 mt-2 font-mono break-all max-w-[240px]">
                            {logoUrl || 'Belum ada file diunggah'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Favicon Upload Block */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Favicon Website</label>
                      <div className="border border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        {faviconUrl ? (
                          <div className="mb-3 relative group">
                            <img src={faviconUrl} alt="Favicon Preview" className="w-8 h-8 object-contain rounded-lg border border-slate-100 bg-white p-1" />
                            <button
                              type="button"
                              onClick={() => setFaviconUrl('')}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center shadow hover:bg-red-600"
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                            <i className="fa-solid fa-icons text-lg"></i>
                          </div>
                        )}

                        <div className="text-center">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-emerald-600 rounded-xl text-xs font-semibold transition-all">
                            {faviconUploading ? (
                              <>
                                <i className="fa-solid fa-circle-notch animate-spin text-emerald-600"></i>
                                Mengunggah...
                              </>
                            ) : (
                              <>
                                <i className="fa-solid fa-cloud-arrow-up"></i>
                                {faviconUrl ? 'Ganti Favicon' : 'Pilih Favicon'}
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleUpload(e, 'favicon')}
                              disabled={faviconUploading}
                              className="hidden"
                            />
                          </label>
                          <p className="text-[10px] text-slate-400 mt-2 font-mono break-all max-w-[240px]">
                            {faviconUrl || 'Belum ada file diunggah'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Max post free membership */}
                  <div className="max-w-xs">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Batas Post Event Gratis (Free Member)</label>
                    <input
                      type="number"
                      value={maxPostFree}
                      onChange={(e) => setMaxPostFree(parseInt(e.target.value || '0'))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-semibold"
                      required
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      Jumlah maksimum ajakan event yang dapat dibuat oleh anggota reguler secara gratis.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Socials */}
              {activeTab === 'socials' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">
                      Tautan Sosial Media
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tautan Instagram</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <i className="fa-brands fa-instagram text-base"></i>
                      </div>
                      <input
                        type="text"
                        placeholder="https://instagram.com/akun-anda"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tautan Facebook</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <i className="fa-brands fa-facebook text-base"></i>
                      </div>
                      <input
                        type="text"
                        placeholder="https://facebook.com/halaman-anda"
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}



              {/* Tab 4: Custom tracking Code */}
              {activeTab === 'custom_code' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">
                      Injeksi Kode Kustom (Pelacak & Kustomisasi HTML)
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Injeksi Kode Head (Custom Head Code)</label>
                    <textarea
                      rows={6}
                      placeholder="<!-- Google Analytics, Facebook Pixel script, dll. masuk di sini -->"
                      value={headHtml}
                      onChange={(e) => setHeadHtml(e.target.value)}
                      className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-emerald-400 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      Kode yang diletakkan di sini akan disisipkan di dalam tag &lt;head&gt; situs web Anda.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Injeksi Kode Footer (Custom Footer Code)</label>
                    <textarea
                      rows={6}
                      placeholder="<!-- Custom JavaScript, chat widget, dll. masuk di sini -->"
                      value={footerHtml}
                      onChange={(e) => setFooterHtml(e.target.value)}
                      className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-emerald-400 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      Kode yang diletakkan di sini akan disisipkan tepat sebelum tag penutup &lt;/body&gt; situs web Anda.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-2xl text-xs transition-all disabled:bg-slate-400 flex items-center gap-2 shadow-lg shadow-emerald-100 hover:shadow-emerald-200"
                >
                  {saving ? (
                    <>
                      <i className="fa-solid fa-circle-notch animate-spin"></i>
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Pengaturan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
