'use client';

import { useState, useEffect } from 'react';

export interface NewRegionFormState {
  name: string;
  isSupplyOnly: boolean;
  labourPerSqft: number;
  miscPerSqft: number;
  labourMin: number;
  miscMin: number;
  extraLinPerWindow: number;
  fixedSetupFee: number;
  baseTravelFee: number;
  officeLat: number;
  officeLon: number;
  freeCities: string;
  setupFeeOptions: { label: string; value: number }[];
}

export const DEFAULT_NEW_REGION: NewRegionFormState = {
  name: '',
  isSupplyOnly: false,
  labourPerSqft: 19,
  miscPerSqft: 8,
  labourMin: 325,
  miscMin: 74,
  extraLinPerWindow: 2.17,
  fixedSetupFee: 140,
  baseTravelFee: 0,
  officeLat: 48.6017,
  officeLon: -93.3986,
  freeCities: '',
  setupFeeOptions: [{ label: 'Standard Setup', value: 140 }],
};

export function useAdminRegions() {
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [geocoding, setGeocoding] = useState<string | null>(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [fullscreenRegionId, setFullscreenRegionId] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteConfirmRegion, setDeleteConfirmRegion] = useState<any | null>(null);
  const [newRegion, setNewRegion] = useState<NewRegionFormState>(DEFAULT_NEW_REGION);

  const updateRegion = (id: string, field: string, value: any) => {
    setRegions((prev) =>
      prev.map((r) => (r._id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleAutoLocate = async (
    targetCity: string,
    isForNewRegion: boolean,
    regionId?: string
  ) => {
    if (!targetCity.trim()) return;
    setGeocoding(isForNewRegion ? 'new' : regionId || 'card');
    try {
      let res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          targetCity.trim() + ', Ontario, Canada'
        )}`
      );
      let data = await res.json();
      if (!data || !data.length) {
        res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            targetCity.trim()
          )}`
        );
        data = await res.json();
      }
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (!isNaN(lat) && !isNaN(lon)) {
          if (isForNewRegion) {
            setNewRegion((prev) => ({
              ...prev,
              officeLat: Number(lat.toFixed(4)),
              officeLon: Number(lon.toFixed(4)),
            }));
            setMessage({
              text: `Found location for "${targetCity}": ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
              type: 'success',
            });
          } else if (regionId) {
            updateRegion(regionId, 'officeLat', Number(lat.toFixed(4)));
            updateRegion(regionId, 'officeLon', Number(lon.toFixed(4)));
            setMessage({
              text: `Updated map center for "${targetCity}": ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
              type: 'success',
            });
          }
        }
      } else {
        setMessage({
          text: `Could not find coordinates for "${targetCity}". Please enter manually.`,
          type: 'error',
        });
      }
    } catch (err: any) {
      setMessage({
        text: `Geocoding request failed: ${err.message}`,
        type: 'error',
      });
    } finally {
      setGeocoding(null);
    }
  };

  const handleToggleNewSupplyOnly = (val: boolean) => {
    setNewRegion((prev) => ({
      ...prev,
      isSupplyOnly: val,
      ...(val
        ? {
            labourPerSqft: 0,
            miscPerSqft: 0,
            labourMin: 0,
            miscMin: 0,
            extraLinPerWindow: 2.17,
            fixedSetupFee: 0,
            baseTravelFee: 0,
            setupFeeOptions: [{ label: 'Supply Only (No Setup)', value: 0 }],
          }
        : {
            labourPerSqft: 19,
            miscPerSqft: 8,
            labourMin: 325,
            miscMin: 74,
            extraLinPerWindow: 2.17,
            fixedSetupFee: 140,
            baseTravelFee: 0,
            setupFeeOptions: [{ label: 'Standard Setup', value: 140 }],
          }),
    }));
  };

  const handleCreateRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegion.name.trim()) return;
    setCreating(true);
    setMessage({ text: '', type: '' });
    try {
      const payload = {
        ...newRegion,
        freeCities: newRegion.freeCities
          ? newRegion.freeCities
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        setupFeeOptions: newRegion.setupFeeOptions.filter((o) => o.label.trim()),
      };
      const res = await fetch('/api/regions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create region');
      setRegions((prev) => [...prev, data]);
      setIsCreateOpen(false);
      setMessage({ text: `Region "${data.name}" created successfully!`, type: 'success' });
      setNewRegion(DEFAULT_NEW_REGION);
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRegion = async (regionId: string) => {
    try {
      const res = await fetch(`/api/regions/${regionId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete region');
      setRegions((prev) => prev.filter((r) => r._id !== regionId));
      setDeleteConfirmRegion(null);
      setMessage({ text: 'Region deleted successfully!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  useEffect(() => {
    fetch('/api/regions')
      .then((res) => res.json())
      .then((data) => {
        setRegions(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  // Listen for Escape key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullscreenRegionId) setFullscreenRegionId(null);
        if (isCreateOpen) setIsCreateOpen(false);
        if (deleteConfirmRegion) setDeleteConfirmRegion(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenRegionId, isCreateOpen, deleteConfirmRegion]);

  const handleSave = async (region: any) => {
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await fetch(`/api/regions/${region._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(region),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ text: `${region.name} updated successfully!`, type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const fullscreenRegion = regions.find((r) => r._id === fullscreenRegionId);

  return {
    regions,
    loading,
    saving,
    creating,
    geocoding,
    message,
    fullscreenRegionId,
    setFullscreenRegionId,
    fullscreenRegion,
    isCreateOpen,
    setIsCreateOpen,
    deleteConfirmRegion,
    setDeleteConfirmRegion,
    newRegion,
    setNewRegion,
    updateRegion,
    handleAutoLocate,
    handleToggleNewSupplyOnly,
    handleCreateRegion,
    handleDeleteRegion,
    handleSave,
  };
}

