import React from 'react';
import { 
  Globe, 
  MessageCircle, 
  AppWindow, 
  Share2, 
  Wifi, 
  User, 
  FileText, 
  Mail,
  ExternalLink
} from 'lucide-react';
import { ContentType, QRState } from '../types/qr';

interface ContentTabsProps {
  state: QRState;
  onChange: (updater: (prev: QRState) => QRState) => void;
}

export const ContentTabs: React.FC<ContentTabsProps> = ({ state, onChange }) => {
  const tabs: { id: ContentType; label: string; icon: React.ReactNode }[] = [
    { id: 'url', label: 'Website URL', icon: <Globe className="w-4 h-4" /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'appstore', label: 'App Store', icon: <AppWindow className="w-4 h-4" /> },
    { id: 'social', label: 'Social Profile', icon: <Share2 className="w-4 h-4" /> },
    { id: 'wifi', label: 'Wi-Fi Network', icon: <Wifi className="w-4 h-4" /> },
    { id: 'vcard', label: 'Contact Card', icon: <User className="w-4 h-4" /> },
    { id: 'email', label: 'Email Draft', icon: <Mail className="w-4 h-4" /> },
    { id: 'text', label: 'Plain Text', icon: <FileText className="w-4 h-4" /> },
  ];

  const handleTabSelect = (type: ContentType) => {
    onChange((prev) => {
      let nextRaw = prev.rawText;
      let nextLogo = { ...prev.logo };

      // Optional smart auto-select matching preset logo if none chosen or relevant
      if (type === 'whatsapp') {
        const cleanPhone = prev.whatsapp.phone.replace(/[^0-9]/g, '');
        const fullPhone = (prev.whatsapp.countryCode.replace('+', '') + cleanPhone);
        const encoded = encodeURIComponent(prev.whatsapp.message);
        nextRaw = `https://wa.me/${fullPhone}${encoded ? `?text=${encoded}` : ''}`;
        if (nextLogo.sourceType === 'none' || nextLogo.presetId === 'apple') {
          nextLogo = { ...nextLogo, sourceType: 'preset', presetId: 'whatsapp' };
        }
      } else if (type === 'appstore') {
        nextRaw = prev.appStore.customUrl || `https://apps.apple.com/app/id${prev.appStore.appId || '1234567890'}`;
        if (nextLogo.sourceType === 'none') {
          nextLogo = { ...nextLogo, sourceType: 'preset', presetId: prev.appStore.platform === 'apple' ? 'apple' : 'google-play' };
        }
      } else if (type === 'social') {
        const map: Record<string, string> = {
          instagram: `https://instagram.com/${prev.social.username || 'username'}`,
          x: `https://x.com/${prev.social.username || 'username'}`,
          linkedin: `https://linkedin.com/in/${prev.social.username || 'username'}`,
          youtube: `https://youtube.com/@${prev.social.username || 'username'}`,
          tiktok: `https://tiktok.com/@${prev.social.username || 'username'}`,
          facebook: `https://facebook.com/${prev.social.username || 'username'}`,
          github: `https://github.com/${prev.social.username || 'username'}`
        };
        nextRaw = map[prev.social.platform] || `https://instagram.com/${prev.social.username}`;
        if (nextLogo.sourceType === 'none') {
          nextLogo = { ...nextLogo, sourceType: 'preset', presetId: prev.social.platform };
        }
      } else if (type === 'wifi') {
        nextRaw = `WIFI:T:${prev.wifi.encryption};S:${prev.wifi.ssid};P:${prev.wifi.password};H:${prev.wifi.hidden ? 'true' : 'false'};;`;
        if (nextLogo.sourceType === 'none') {
          nextLogo = { ...nextLogo, sourceType: 'preset', presetId: 'wifi' };
        }
      } else if (type === 'url') {
        nextRaw = prev.url || 'https://example.com';
      }

      return {
        ...prev,
        contentType: type,
        rawText: nextRaw,
        logo: nextLogo
      };
    });
  };

  const updateUrl = (val: string) => {
    onChange((prev) => ({
      ...prev,
      url: val,
      rawText: val
    }));
  };

  const updateWhatsApp = (field: 'countryCode' | 'phone' | 'message', val: string) => {
    onChange((prev) => {
      const nextWA = { ...prev.whatsapp, [field]: val };
      const cleanPhone = nextWA.phone.replace(/[^0-9]/g, '');
      const fullPhone = (nextWA.countryCode.replace('+', '') + cleanPhone);
      const encodedMsg = encodeURIComponent(nextWA.message);
      const raw = `https://wa.me/${fullPhone}${encodedMsg ? `?text=${encodedMsg}` : ''}`;
      return {
        ...prev,
        whatsapp: nextWA,
        rawText: raw
      };
    });
  };

  const updateAppStore = (field: 'platform' | 'appId' | 'customUrl', val: any) => {
    onChange((prev) => {
      const nextStore = { ...prev.appStore, [field]: val };
      let raw = nextStore.customUrl;
      if (!raw) {
        if (nextStore.platform === 'apple') {
          raw = `https://apps.apple.com/app/id${nextStore.appId || '1234567890'}`;
        } else {
          raw = `https://play.google.com/store/apps/details?id=${nextStore.appId || 'com.example.app'}`;
        }
      }

      const isGoogle = nextStore.platform === 'google';
      const isBannerMatching = prev.frame.text === 'GET ON APP STORE' || prev.frame.text === 'GET IT ON GOOGLE PLAY';

      return {
        ...prev,
        appStore: nextStore,
        rawText: raw,
        logo: {
          ...prev.logo,
          sourceType: 'preset',
          presetId: isGoogle ? 'google-play' : 'apple'
        },
        frame: isBannerMatching
          ? {
              ...prev.frame,
              text: isGoogle ? 'GET IT ON GOOGLE PLAY' : 'GET ON APP STORE',
              frameColor: isGoogle ? '#01875F' : '#0071E3'
            }
          : prev.frame
      };
    });
  };

  const updateSocial = (field: 'platform' | 'username', val: string) => {
    onChange((prev) => {
      const nextSocial = { ...prev.social, [field]: val };
      const map: Record<string, string> = {
        instagram: `https://instagram.com/${nextSocial.username || 'username'}`,
        x: `https://x.com/${nextSocial.username || 'username'}`,
        linkedin: `https://linkedin.com/in/${nextSocial.username || 'username'}`,
        youtube: `https://youtube.com/@${nextSocial.username || 'username'}`,
        tiktok: `https://tiktok.com/@${nextSocial.username || 'username'}`,
        facebook: `https://facebook.com/${nextSocial.username || 'username'}`,
        github: `https://github.com/${nextSocial.username || 'username'}`
      };
      const raw = map[nextSocial.platform] || `https://instagram.com/${nextSocial.username}`;
      return {
        ...prev,
        social: nextSocial,
        rawText: raw,
        logo: {
          ...prev.logo,
          sourceType: 'preset',
          presetId: nextSocial.platform
        }
      };
    });
  };

  const updateWifi = (field: 'ssid' | 'password' | 'encryption' | 'hidden', val: any) => {
    onChange((prev) => {
      const nextWifi = { ...prev.wifi, [field]: val };
      const raw = `WIFI:T:${nextWifi.encryption};S:${nextWifi.ssid};P:${nextWifi.password};H:${nextWifi.hidden ? 'true' : 'false'};;`;
      return {
        ...prev,
        wifi: nextWifi,
        rawText: raw
      };
    });
  };

  const updateVCard = (field: string, val: string) => {
    onChange((prev) => {
      const nextVCard = { ...prev.vcard, [field]: val };
      const raw = `BEGIN:VCARD\nVERSION:3.0\nN:${nextVCard.lastName};${nextVCard.firstName};;;\nFN:${nextVCard.firstName} ${nextVCard.lastName}\nORG:${nextVCard.organization}\nTITLE:${nextVCard.title}\nTEL:${nextVCard.phone}\nEMAIL:${nextVCard.email}\nURL:${nextVCard.website}\nEND:VCARD`;
      return {
        ...prev,
        vcard: nextVCard,
        rawText: raw
      };
    });
  };

  const updateEmail = (field: 'address' | 'subject' | 'body', val: string) => {
    onChange((prev) => {
      const nextEmail = { ...prev.email, [field]: val };
      const raw = `mailto:${nextEmail.address}?subject=${encodeURIComponent(nextEmail.subject)}&body=${encodeURIComponent(nextEmail.body)}`;
      return {
        ...prev,
        email: nextEmail,
        rawText: raw
      };
    });
  };

  return (
    <section id="content-section" className="bg-slate-900/60 rounded-xl p-5 border border-slate-800/80 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase font-display">
            01. Content Destination
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select the destination payload encoded into the QR code matrix
          </p>
        </div>
      </div>

      {/* Segmented Filter Control for Content Types */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-950/60 rounded-lg border border-slate-800 mb-5">
        {tabs.map((tab) => {
          const isActive = state.contentType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabSelect(tab.id)}
              className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mode-specific input fields */}
      <div className="space-y-4">
        {/* 1. URL */}
        {state.contentType === 'url' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Website URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={state.url}
                onChange={(e) => updateUrl(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <div className="absolute right-3 top-2.5 text-slate-500 pointer-events-none">
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <span>Quick tests:</span>
              <button
                type="button"
                onClick={() => updateUrl('https://apple.com')}
                className="hover:text-indigo-400 underline underline-offset-2"
              >
                Apple
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => updateUrl('https://google.com')}
                className="hover:text-indigo-400 underline underline-offset-2"
              >
                Google
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => updateUrl('https://github.com')}
                className="hover:text-indigo-400 underline underline-offset-2"
              >
                GitHub
              </button>
            </div>
          </div>
        )}

        {/* 2. WhatsApp */}
        {state.contentType === 'whatsapp' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Country Code
                </label>
                <input
                  type="text"
                  value={state.whatsapp.countryCode}
                  onChange={(e) => updateWhatsApp('countryCode', e.target.value)}
                  placeholder="+1"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Phone Number (numbers only)
                </label>
                <input
                  type="tel"
                  value={state.whatsapp.phone}
                  onChange={(e) => updateWhatsApp('phone', e.target.value)}
                  placeholder="5550192834"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Pre-filled Chat Message (Optional)
              </label>
              <textarea
                rows={2}
                value={state.whatsapp.message}
                onChange={(e) => updateWhatsApp('message', e.target.value)}
                placeholder="Hi! I am interested in placing an order."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <p className="text-xs text-slate-400">
              When scanned, opens WhatsApp chat directly to this phone number with your preset text.
            </p>
          </div>
        )}

        {/* 3. App Store */}
        {state.contentType === 'appstore' && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-slate-300">Store Platform:</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateAppStore('platform', 'apple')}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                    state.appStore.platform === 'apple'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Apple App Store
                </button>
                <button
                  type="button"
                  onClick={() => updateAppStore('platform', 'google')}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                    state.appStore.platform === 'google'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Google Play Store
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {state.appStore.platform === 'apple' ? 'App ID or App Store URL' : 'Package Name (e.g. com.example.app) or Play Store URL'}
              </label>
              <input
                type="text"
                value={state.appStore.customUrl || state.appStore.appId}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith('http')) {
                    updateAppStore('customUrl', val);
                  } else {
                    updateAppStore('appId', val);
                  }
                }}
                placeholder={state.appStore.platform === 'apple' ? '1234567890 or https://apps.apple.com/...' : 'com.instagram.android or https://play.google.com/...'}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* 4. Social Profile */}
        {state.contentType === 'social' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Social Platform
              </label>
              <select
                value={state.social.platform}
                onChange={(e) => updateSocial('platform', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="instagram">Instagram</option>
                <option value="x">X (Twitter)</option>
                <option value="linkedin">LinkedIn</option>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
                <option value="github">GitHub</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Username / Handle
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-slate-500">@</span>
                <input
                  type="text"
                  value={state.social.username}
                  onChange={(e) => updateSocial('username', e.target.value.replace(/^@/, ''))}
                  placeholder="username"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. Wi-Fi */}
        {state.contentType === 'wifi' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Network Name (SSID)
                </label>
                <input
                  type="text"
                  value={state.wifi.ssid}
                  onChange={(e) => updateWifi('ssid', e.target.value)}
                  placeholder="MyHomeWiFi"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <input
                  type="text"
                  value={state.wifi.password}
                  onChange={(e) => updateWifi('password', e.target.value)}
                  placeholder="Secret123"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-300">Security:</label>
                <select
                  value={state.wifi.encryption}
                  onChange={(e) => updateWifi('encryption', e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200"
                >
                  <option value="WPA">WPA / WPA2 / WPA3</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None (Open)</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={state.wifi.hidden}
                  onChange={(e) => updateWifi('hidden', e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                />
                <span>Hidden Network</span>
              </label>
            </div>
          </div>
        )}

        {/* 6. vCard */}
        {state.contentType === 'vcard' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">First Name</label>
                <input
                  type="text"
                  value={state.vcard.firstName}
                  onChange={(e) => updateVCard('firstName', e.target.value)}
                  placeholder="Jane"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Last Name</label>
                <input
                  type="text"
                  value={state.vcard.lastName}
                  onChange={(e) => updateVCard('lastName', e.target.value)}
                  placeholder="Doe"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={state.vcard.phone}
                  onChange={(e) => updateVCard('phone', e.target.value)}
                  placeholder="+1 555 123 4567"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={state.vcard.email}
                  onChange={(e) => updateVCard('email', e.target.value)}
                  placeholder="jane@company.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Organization</label>
                <input
                  type="text"
                  value={state.vcard.organization}
                  onChange={(e) => updateVCard('organization', e.target.value)}
                  placeholder="Acme Studio"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Job Title</label>
                <input
                  type="text"
                  value={state.vcard.title}
                  onChange={(e) => updateVCard('title', e.target.value)}
                  placeholder="Creative Director"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* 7. Email */}
        {state.contentType === 'email' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Recipient Email</label>
              <input
                type="email"
                value={state.email.address}
                onChange={(e) => updateEmail('address', e.target.value)}
                placeholder="support@example.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
              <input
                type="text"
                value={state.email.subject}
                onChange={(e) => updateEmail('subject', e.target.value)}
                placeholder="Product Inquiry"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Message Body</label>
              <textarea
                rows={2}
                value={state.email.body}
                onChange={(e) => updateEmail('body', e.target.value)}
                placeholder="Hello team, I would like to inquire..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
              />
            </div>
          </div>
        )}

        {/* 8. Text */}
        {state.contentType === 'text' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Plain Text or Notes
            </label>
            <textarea
              rows={3}
              value={state.rawText}
              onChange={(e) => {
                const val = e.target.value;
                onChange((prev) => ({
                  ...prev,
                  text: { content: val },
                  rawText: val
                }));
              }}
              placeholder="Enter any text or note..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}
      </div>
    </section>
  );
};
