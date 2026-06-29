import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Button, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  useDisclosure,
  Input,
  Textarea,
  Select,
  SelectItem,
  Accordion,
  AccordionItem
} from '@nextui-org/react';
import { 
  Plus, 
  LogOut, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Calendar, 
  Globe, 
  ExternalLink,
  Edit2,
  Trash2,
  Eye
} from 'lucide-react';

const ICON_OPTIONS = [
  { key: 'work', label: 'Pekerjaan', icon: <Briefcase size={24} /> },
  { key: 'education', label: 'Edukasi', icon: <GraduationCap size={24} /> },
  { key: 'document', label: 'Dokumen/Form', icon: <FileText size={24} /> },
  { key: 'calendar', label: 'Jadwal', icon: <Calendar size={24} /> },
  { key: 'web', label: 'Website Lain', icon: <Globe size={24} /> },
];

export default function Dashboard({ session }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [editingId, setEditingId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    notes: '',
    icon: 'web'
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setLinks(data);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ title: '', url: '', notes: '', icon: 'web' });
    onOpen();
  };

  const openEditModal = (link) => {
    setEditingId(link.id);
    setFormData({
      title: link.title,
      url: link.url,
      notes: link.notes || '',
      icon: link.icon || 'web'
    });
    onOpen();
  };

  const saveLink = async (onClose) => {
    if (!formData.title || !formData.url) return;
    
    // Ensure URL has http/https
    let finalUrl = formData.url;
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    const payload = {
      user_id: session.user.id,
      title: formData.title,
      url: finalUrl,
      notes: formData.notes,
      icon: formData.icon
    };

    if (editingId) {
      await supabase.from('links').update(payload).eq('id', editingId);
    } else {
      await supabase.from('links').insert([payload]);
    }
    
    await fetchLinks();
    onClose();
  };

  const deleteLink = async (id) => {
    if(window.confirm("Apakah Anda yakin ingin menghapus tautan ini?")) {
      await supabase.from('links').delete().eq('id', id);
      fetchLinks();
    }
  };

  const getIconElement = (key) => {
    const found = ICON_OPTIONS.find(i => i.key === key);
    return found ? found.icon : <Globe size={24} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Navbar / Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-primary">Linklink</h1>
          <p className="text-sm text-gray-500">
            Halo, {session.user.user_metadata?.display_name || 'Pengguna'}
          </p>
        </div>
        <Button 
          color="danger" 
          variant="flat" 
          onPress={handleLogout}
          isIconOnly
          aria-label="Keluar"
        >
          <LogOut size={20} />
        </Button>
      </div>

      <div className="max-w-3xl mx-auto mt-8 px-4">
        
        {loading ? (
          <div className="text-center py-10 text-gray-500">Memuat data...</div>
        ) : links.length === 0 ? (
          /* Tampilan Awal (Kosong) */
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 px-6 text-center">
            <div className="bg-primary/10 p-6 rounded-full mb-6 text-primary">
              <Plus size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Belum Ada Tautan</h2>
            <p className="text-gray-500 mb-8 text-lg">Buat link pertama Anda untuk mulai mengatur aplikasi dan catatan Anda.</p>
            <Button 
              color="primary" 
              size="lg" 
              className="text-xl px-10 py-8 font-bold shadow-lg shadow-primary/30 rounded-full"
              onPress={openCreateModal}
              startContent={<Plus size={28} />}
            >
              Buat Link Pertama Anda
            </Button>
          </div>
        ) : (
          /* Tampilan Daftar Link */
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-700">Daftar Aplikasi Anda</h2>
              <Button 
                color="primary" 
                onPress={openCreateModal}
                startContent={<Plus size={20} />}
                className="font-bold rounded-full"
              >
                Tambah Link
              </Button>
            </div>
            
            <Accordion variant="splitted" className="gap-4">
              {links.map((link) => (
                <AccordionItem
                  key={link.id}
                  aria-label={link.title}
                  className="bg-white shadow-sm border border-gray-100"
                  classNames={{
                    title: "text-lg font-bold text-gray-800",
                    indicator: "text-primary",
                  }}
                  startContent={
                    <div className="bg-primary/10 p-3 rounded-full text-primary mr-2">
                      {getIconElement(link.icon)}
                    </div>
                  }
                  title={link.title}
                >
                  <div className="pt-2 pb-4 px-2">
                    {/* Notes Section - Accordion content acts as the "Intip Catatan" */}
                    {link.notes ? (
                      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-6">
                        <div className="flex items-center gap-2 text-amber-800 font-semibold mb-1">
                          <Eye size={18} /> Catatan Akun:
                        </div>
                        <p className="text-amber-900 whitespace-pre-wrap">{link.notes}</p>
                      </div>
                    ) : (
                      <p className="text-gray-400 italic mb-6">Tidak ada catatan untuk aplikasi ini.</p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        color="success" 
                        className="text-white font-bold flex-1"
                        size="lg"
                        onPress={() => window.open(link.url, '_blank')}
                        startContent={<ExternalLink size={20} />}
                      >
                        Buka Aplikasi
                      </Button>
                      <Button 
                        color="warning" 
                        variant="flat"
                        className="font-bold font-lg"
                        size="lg"
                        onPress={() => openEditModal(link)}
                        startContent={<Edit2 size={20} />}
                      >
                        Edit
                      </Button>
                      <Button 
                        color="danger" 
                        variant="flat"
                        className="font-bold"
                        size="lg"
                        onPress={() => deleteLink(link.id)}
                        startContent={<Trash2 size={20} />}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </div>

      {/* Modal Form Tambah/Edit */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-2xl">
                {editingId ? 'Edit Tautan' : 'Tambah Tautan Baru'}
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Judul Aplikasi"
                  placeholder="Contoh: Portal Akademik"
                  variant="bordered"
                  size="lg"
                  value={formData.title}
                  onValueChange={(val) => setFormData({...formData, title: val})}
                  classNames={{label: "font-semibold text-base"}}
                />
                
                <Input
                  label="URL / Link"
                  placeholder="Contoh: portal.kampus.ac.id"
                  variant="bordered"
                  size="lg"
                  value={formData.url}
                  onValueChange={(val) => setFormData({...formData, url: val})}
                  classNames={{label: "font-semibold text-base"}}
                />

                <Select 
                  label="Pilih Ikon" 
                  variant="bordered"
                  size="lg"
                  selectedKeys={[formData.icon]}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  classNames={{label: "font-semibold text-base"}}
                >
                  {ICON_OPTIONS.map((item) => (
                    <SelectItem key={item.key} value={item.key} startContent={item.icon}>
                      {item.label}
                    </SelectItem>
                  ))}
                </Select>

                <Textarea
                  label="Catatan Rahasia (Opsional)"
                  placeholder="Misal: Login pakai NIP 12345..."
                  variant="bordered"
                  size="lg"
                  minRows={3}
                  value={formData.notes}
                  onValueChange={(val) => setFormData({...formData, notes: val})}
                  classNames={{label: "font-semibold text-base"}}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose} size="lg" className="font-bold">
                  Batal
                </Button>
                <Button color="primary" onPress={() => saveLink(onClose)} size="lg" className="font-bold">
                  Simpan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

    </div>
  );
}
