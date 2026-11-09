'use client';

import { useState, useEffect } from 'react';
import {
  ComboPricing,
  SealedUnitFormulaConstants,
  SealedUnitLabourSettings,
  ThicknessBreak,
  SealedUnitGrillSettings,
  DEFAULT_SEALED_UNIT_COMBOS,
  DEFAULT_FORMULA_CONSTANTS,
  DEFAULT_LABOUR_SETTINGS,
  DEFAULT_THICKNESS_BREAKS,
  DEFAULT_GRILL_SETTINGS,
} from '@/lib/sealed-units-logic';

export function useSealedUnitsSettings() {
  const [combos, setCombos] = useState<ComboPricing[]>(DEFAULT_SEALED_UNIT_COMBOS);
  const [formula, setFormula] = useState<SealedUnitFormulaConstants>(DEFAULT_FORMULA_CONSTANTS);
  const [labour, setLabour] = useState<SealedUnitLabourSettings>(DEFAULT_LABOUR_SETTINGS);
  const [thicknessBreaks, setThicknessBreaks] = useState<ThicknessBreak[]>(DEFAULT_THICKNESS_BREAKS);
  const [grills, setGrills] = useState<SealedUnitGrillSettings>(DEFAULT_GRILL_SETTINGS);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const [staffList, setStaffList] = useState<any[]>([]);
  const [clerkList, setClerkList] = useState<any[]>([]);
  const [assignedReviewer, setAssignedReviewer] = useState<string>('');
  const [selectedOdooClerk, setSelectedOdooClerk] = useState<string>('');

  useEffect(() => {
    fetch('/api/sealed-units/settings')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.combos) && data.combos.length > 0) {
          setCombos(data.combos);
        }
        if (data.formula) setFormula(data.formula);
        if (data.labour) setLabour(data.labour);
        if (Array.isArray(data.thicknessBreaks)) setThicknessBreaks(data.thicknessBreaks);
        if (data.grills) setGrills(data.grills);
        setLoadingSettings(false);
      })
      .catch((err) => {
        console.error('Failed to load sealed unit settings:', err);
        setLoadingSettings(false);
      });

    // Reviewer and Clerk lists with strict SUPERADMIN masking
    Promise.all([
      fetch(`/api/users?t=${Date.now()}`, { cache: 'no-store' }).then((r) =>
        r.ok ? r.json() : []
      ),
      fetch(`/api/users?assignees=true&t=${Date.now()}`, { cache: 'no-store' }).then((r) =>
        r.ok ? r.json() : []
      ),
    ])
      .then(([allUsers, assignees]) => {
        if (Array.isArray(allUsers)) {
          const eligible = allUsers.filter(
            (d: any) =>
              d.role !== 'SUPERADMIN' &&
              d.role !== 'superadmin' &&
              !d.username?.toLowerCase().includes('superadmin')
          );
          setStaffList(eligible);
          if (eligible.length > 0) {
            setAssignedReviewer(eligible[0].username);
          }
        }
        if (Array.isArray(assignees)) {
          const eligible = assignees.filter(
            (d: any) =>
              d.role !== 'SUPERADMIN' &&
              d.role !== 'superadmin' &&
              !d.username?.toLowerCase().includes('superadmin')
          );
          setClerkList(eligible);
          const defaultClerk = eligible.find((c: any) => c.department === 'CLERK') || eligible[0];
          if (defaultClerk) setSelectedOdooClerk(defaultClerk.username);
        }
      })
      .catch(console.error);
  }, []);

  return {
    combos,
    setCombos,
    formula,
    setFormula,
    labour,
    setLabour,
    thicknessBreaks,
    setThicknessBreaks,
    grills,
    setGrills,
    loadingSettings,
    staffList,
    clerkList,
    assignedReviewer,
    setAssignedReviewer,
    selectedOdooClerk,
    setSelectedOdooClerk,
  };
}

