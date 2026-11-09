interface RestoreSetters {
  setAddons: (map: Record<string, string>) => void;
  setDbAddons: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedRegionId: (id: string) => void;
  setJambId: (id: string) => void;
  setJambName: (name: string) => void;
  setJambRate: (rate: string) => void;
  setCasingId: (id: string) => void;
  setCasingName: (name: string) => void;
  setCasingRate: (rate: string) => void;
  setCoords: (coords: string) => void;
  setManualKm: (km: string) => void;
  setManualHours: (hours: string) => void;
  setCrew: (crew: string) => void;
  setSetupFee: (fee: string) => void;
  setDiscount: (discount: string) => void;
  setHstOn: (on: boolean) => void;
  setIncludeLabour: (inc: boolean) => void;
  setIncludeMisc: (inc: boolean) => void;
  setIncludeJC: (inc: boolean) => void;
}

interface RestoreDbContext {
  regions: any[];
  dbJambs: any[];
  dbCasings: any[];
}

export function restoreSavedTaxState(
  savedTaxTotals: any,
  setters: RestoreSetters,
  context: RestoreDbContext
) {
  const { regions, dbJambs, dbCasings } = context;

  // Restore addonsMap or extract from selectedAddons
  let restoredMap: Record<string, string> = {};
  if (savedTaxTotals.addonsMap && Object.keys(savedTaxTotals.addonsMap).length > 0) {
    restoredMap = { ...savedTaxTotals.addonsMap };
  } else if (
    savedTaxTotals.selectedAddons &&
    Array.isArray(savedTaxTotals.selectedAddons) &&
    savedTaxTotals.selectedAddons.length > 0
  ) {
    savedTaxTotals.selectedAddons.forEach((sa: any) => {
      if (sa.id) restoredMap[sa.id] = String(sa.qty || '1');
    });
  }
  if (Object.keys(restoredMap).length > 0) {
    setters.setAddons(restoredMap);
  }

  // Restore custom / dbAddons
  if (
    savedTaxTotals.dbAddons &&
    Array.isArray(savedTaxTotals.dbAddons) &&
    savedTaxTotals.dbAddons.length > 0
  ) {
    setters.setDbAddons(savedTaxTotals.dbAddons);
  } else if (savedTaxTotals.selectedAddons && Array.isArray(savedTaxTotals.selectedAddons)) {
    setters.setDbAddons((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const missing = savedTaxTotals.selectedAddons.filter((sa: any) => !existingIds.has(sa.id));
      if (missing.length === 0) return prev;
      return [
        ...prev,
        ...missing.map((m: any) => ({
          id: m.id,
          label: m.label,
          lab: (m.lab || 0) / (m.qty || 1),
          misc: (m.misc || 0) / (m.qty || 1),
          isCustom: true,
        })),
      ];
    });
  }

  // Restore region
  if (savedTaxTotals.selectedRegionId) {
    setters.setSelectedRegionId(savedTaxTotals.selectedRegionId);
  } else if (savedTaxTotals.regionName && regions.length > 0) {
    const match = regions.find(
      (r) => r.name.toLowerCase() === savedTaxTotals.regionName.toLowerCase()
    );
    if (match) setters.setSelectedRegionId(match._id);
  }

  // Restore jambs
  if (savedTaxTotals.jambId !== undefined) {
    setters.setJambId(savedTaxTotals.jambId);
  } else if (savedTaxTotals.selectedJamb === null) {
    setters.setJambId('none');
  } else if (savedTaxTotals.selectedJamb?.id) {
    setters.setJambId(savedTaxTotals.selectedJamb.id);
  } else if (savedTaxTotals.jambName || savedTaxTotals.selectedJamb?.name) {
    const targetName = (
      savedTaxTotals.jambName ||
      savedTaxTotals.selectedJamb?.name ||
      ''
    ).toLowerCase();
    const matchJ = dbJambs.find(
      (j) => j.label?.toLowerCase() === targetName || j.name?.toLowerCase() === targetName
    );
    if (matchJ) {
      setters.setJambId(matchJ.id);
    } else {
      setters.setJambId('custom');
      setters.setJambName(savedTaxTotals.jambName || savedTaxTotals.selectedJamb?.name);
    }
  }
  if (savedTaxTotals.jambRate !== undefined) setters.setJambRate(String(savedTaxTotals.jambRate));
  else if (savedTaxTotals.selectedJamb?.rate !== undefined)
    setters.setJambRate(String(savedTaxTotals.selectedJamb.rate));
  if (savedTaxTotals.jambName) setters.setJambName(savedTaxTotals.jambName);
  else if (savedTaxTotals.selectedJamb?.name) setters.setJambName(savedTaxTotals.selectedJamb.name);

  // Restore casings
  if (savedTaxTotals.casingId !== undefined) {
    setters.setCasingId(savedTaxTotals.casingId);
  } else if (savedTaxTotals.selectedCasing === null) {
    setters.setCasingId('none');
  } else if (savedTaxTotals.selectedCasing?.id) {
    setters.setCasingId(savedTaxTotals.selectedCasing.id);
  } else if (savedTaxTotals.casingName || savedTaxTotals.selectedCasing?.name) {
    const targetName = (
      savedTaxTotals.casingName ||
      savedTaxTotals.selectedCasing?.name ||
      ''
    ).toLowerCase();
    const matchC = dbCasings.find(
      (c) => c.label?.toLowerCase() === targetName || c.name?.toLowerCase() === targetName
    );
    if (matchC) {
      setters.setCasingId(matchC.id);
    } else {
      setters.setCasingId('custom');
      setters.setCasingName(savedTaxTotals.casingName || savedTaxTotals.selectedCasing?.name);
    }
  }
  if (savedTaxTotals.casingRate !== undefined) setters.setCasingRate(String(savedTaxTotals.casingRate));
  else if (savedTaxTotals.selectedCasing?.rate !== undefined)
    setters.setCasingRate(String(savedTaxTotals.selectedCasing.rate));
  if (savedTaxTotals.casingName) setters.setCasingName(savedTaxTotals.casingName);
  else if (savedTaxTotals.selectedCasing?.name) setters.setCasingName(savedTaxTotals.selectedCasing.name);

  // Restore travel & extras
  if (savedTaxTotals.coords) setters.setCoords(savedTaxTotals.coords);
  if (savedTaxTotals.manualKm !== undefined) setters.setManualKm(String(savedTaxTotals.manualKm));
  if (savedTaxTotals.manualHours !== undefined)
    setters.setManualHours(String(savedTaxTotals.manualHours));
  if (savedTaxTotals.crew !== undefined) setters.setCrew(String(savedTaxTotals.crew));
  if (savedTaxTotals.setup !== undefined || savedTaxTotals.setupFee !== undefined) {
    setters.setSetupFee(String(savedTaxTotals.setup ?? savedTaxTotals.setupFee));
  }
  if (savedTaxTotals.discount !== undefined) setters.setDiscount(String(savedTaxTotals.discount));
  if (savedTaxTotals.hstOn !== undefined) setters.setHstOn(Boolean(savedTaxTotals.hstOn));
  if (savedTaxTotals.includeLabour !== undefined)
    setters.setIncludeLabour(Boolean(savedTaxTotals.includeLabour));
  if (savedTaxTotals.includeMisc !== undefined)
    setters.setIncludeMisc(Boolean(savedTaxTotals.includeMisc));
  if (savedTaxTotals.includeJC !== undefined) setters.setIncludeJC(Boolean(savedTaxTotals.includeJC));
}


export function computeTaxQuoteKey(savedTaxTotals: any): string {
  if (!savedTaxTotals) return '';
  return (
    savedTaxTotals._quoteId ||
    savedTaxTotals._quoteNumber ||
    JSON.stringify({
      reg: savedTaxTotals.selectedRegionId,
      addons: savedTaxTotals.addonsMap,
      selAddonsCount: savedTaxTotals.selectedAddons?.length,
      disc: savedTaxTotals.discount,
      labour: savedTaxTotals.finalLabour,
      jamb:
        savedTaxTotals.jambId ??
        savedTaxTotals.selectedJamb?.id ??
        (savedTaxTotals.selectedJamb === null ? 'none' : 'default'),
      casing:
        savedTaxTotals.casingId ??
        savedTaxTotals.selectedCasing?.id ??
        (savedTaxTotals.selectedCasing === null ? 'none' : 'default'),
    })
  );
}

export function resetTaxState(setters: RestoreSetters) {
  setters.setAddons({});
  setters.setCoords('');
  setters.setManualKm('0');
  setters.setManualHours('0');
  setters.setCrew('2');
  setters.setSetupFee('0');
  setters.setDiscount('');
  setters.setHstOn(true);
  setters.setIncludeLabour(true);
  setters.setIncludeMisc(true);
  setters.setIncludeJC(true);
  setters.setJambId('none');
  setters.setCasingId('none');
}
