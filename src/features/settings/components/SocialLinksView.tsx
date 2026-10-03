import React, { useState } from 'react';
import {
  Share2,
  Globe,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Facebook,
  MessageCircle,
  Save,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { toast } from '@/shared/components/feedback/Toast';

export interface SocialLinksViewProps {
  initialWebsite?: string;
  initialInstagram?: string;
  initialLinkedIn?: string;
  initialTwitter?: string;
  initialYouTube?: string;
  initialFacebook?: string;
  initialWhatsAppCatalog?: string;
  onSave?: (socials: Record<string, string>) => void;
}

export const SocialLinksView: React.FC<SocialLinksViewProps> = ({
  initialWebsite = 'https://vishalenterprise.in',
  initialInstagram = 'https://instagram.com/vishalenterprise',
  initialLinkedIn = 'https://linkedin.com/company/vishal-enterprise',
  initialTwitter = 'https://x.com/vishal_ent',
  initialYouTube = '',
  initialFacebook = 'https://facebook.com/vishalenterprise',
  initialWhatsAppCatalog = 'https://wa.me/c/919876543210',
  onSave,
}) => {
  const [website, setWebsite] = useState(initialWebsite);
  const [instagram, setInstagram] = useState(initialInstagram);
  const [linkedin, setLinkedin] = useState(initialLinkedIn);
  const [twitter, setTwitter] = useState(initialTwitter);
  const [youtube, setYoutube] = useState(initialYouTube);
  const [facebook, setFacebook] = useState(initialFacebook);
  const [waCatalog, setWaCatalog] = useState(initialWhatsAppCatalog);
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      website,
      instagram,
      linkedin,
      twitter,
      youtube,
      facebook,
      waCatalog,
    };
    if (onSave) onSave(data);
    setTimeout(() => {
      setSaving(false);
      toast('Social handles & invoice branding saved!', 'success');
    }, 400);
  };

  return (
    <div className="space-y-8" id="social-links-view">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-[#1E61EB]" />
            <span>Social Links &amp; Invoice Branding</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Add your verified social channels, WhatsApp business catalog, and website to your PDF invoices and online share links.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Main Grid */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
            <Globe className="w-4 h-4 text-gray-500" />
            <span>Public Profile &amp; Social Channels</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Official Website</label>
              <div className="relative">
                <Globe className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="w-full h-8 pl-8 pr-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">WhatsApp Store / Catalog Link</label>
              <div className="relative">
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366] absolute left-2.5 top-2.5" />
                <input
                  type="url"
                  value={waCatalog}
                  onChange={(e) => setWaCatalog(e.target.value)}
                  placeholder="https://wa.me/c/91..."
                  className="w-full h-8 pl-8 pr-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Instagram Profile</label>
              <div className="relative">
                <Instagram className="w-3.5 h-3.5 text-pink-500 absolute left-2.5 top-2.5" />
                <input
                  type="url"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/username"
                  className="w-full h-8 pl-8 pr-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">LinkedIn Company Page</label>
              <div className="relative">
                <Linkedin className="w-3.5 h-3.5 text-blue-600 absolute left-2.5 top-2.5" />
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/company/..."
                  className="w-full h-8 pl-8 pr-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">X (Twitter) Profile</label>
              <div className="relative">
                <Twitter className="w-3.5 h-3.5 text-gray-800 absolute left-2.5 top-2.5" />
                <input
                  type="url"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="https://x.com/handle"
                  className="w-full h-8 pl-8 pr-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Facebook Page</label>
              <div className="relative">
                <Facebook className="w-3.5 h-3.5 text-blue-700 absolute left-2.5 top-2.5" />
                <input
                  type="url"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/pagename"
                  className="w-full h-8 pl-8 pr-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Invoice Footer Badge Preview */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider pb-2 border-b border-gray-100">
            Live Invoice Footer Social Bar Preview
          </h3>
          <p className="text-xs text-gray-500">
            Here is how your verified brand links will appear at the bottom of client invoice PDFs:
          </p>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-gray-500 font-medium">Connect with Vishal Enterprise:</span>
            <div className="flex items-center space-x-3 text-gray-700">
              {website && (
                <span className="flex items-center space-x-1 hover:text-[#1E61EB]">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-semibold text-[11px]">Website</span>
                </span>
              )}
              {instagram && (
                <span className="flex items-center space-x-1 hover:text-pink-600">
                  <Instagram className="w-3.5 h-3.5 text-pink-500" />
                  <span className="font-semibold text-[11px]">Instagram</span>
                </span>
              )}
              {linkedin && (
                <span className="flex items-center space-x-1 hover:text-blue-700">
                  <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-semibold text-[11px]">LinkedIn</span>
                </span>
              )}
              {waCatalog && (
                <span className="flex items-center space-x-1 hover:text-emerald-600">
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  <span className="font-semibold text-[11px]">WhatsApp Store</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#1E61EB] hover:bg-[#174ec4] text-white text-xs font-semibold py-2 px-5 rounded-md transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Social Links'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SocialLinksView;
