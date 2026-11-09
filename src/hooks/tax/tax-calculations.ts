import { parseInches } from '@/components/tax/types';

interface CalculateTaxParams {
  windows: any[];
  region: any;
  windowLabourSettings?: {
    labourPerSqft?: number;
    miscPerSqft?: number;
    labourMin?: number;
    miscMin?: number;
    extraLinPerWindow?: number;
  };
  effectiveIsSupplyOnly: boolean;
  dbAddons: any[];
  addons: Record<string, string>;
  manualKm: string;
  manualHours: string;
  crew: string;
  dbCrewRates: any[];
  dbVehicleRate: number;
  setupFee: string;
  jambId: string;
  jambName: string;
  jambRate: string;
  dbJambs: any[];
  casingId: string;
  casingName: string;
  casingRate: string;
  dbCasings: any[];
  includeLabour: boolean;
  includeMisc: boolean;
  includeJC: boolean;
  discount: string;
  hstOn: boolean;
  selectedRegionId: string;
  coords: string;
  travelCity?: string;
}

export function calculateTaxTotals(p: CalculateTaxParams) {
  const {
    windows,
    region,
    effectiveIsSupplyOnly,
    dbAddons,
    addons,
    manualKm,
    manualHours,
    crew,
    dbCrewRates,
    dbVehicleRate,
    setupFee,
    jambId,
    jambName,
    jambRate,
    dbJambs,
    casingId,
    casingName,
    casingRate,
    dbCasings,
    includeLabour,
    includeMisc,
    includeJC,
    discount,
    hstOn,
    selectedRegionId,
    coords,
    travelCity,
  } = p;

  if (!region) return null;
  let sq = 0,
    ln = 0,
    wLab = 0,
    wMisc = 0;
  const lines = windows.map((w) => {
    const W = parseInches(w.w);
    const H = parseInches(w.h);
    const q = Number(w.qty) || 0;
    if (!W || !H || q <= 0) return null;
    const unitSq = (W * H) / 144;
    const sqft = unitSq * q;
    const extraLin = Number(p.windowLabourSettings?.extraLinPerWindow ?? region.extraLinPerWindow ?? 2.17);
    const lin = ((W * 2 + H * 2) / 12) * q + q * extraLin;
    const labRate = p.windowLabourSettings?.labourPerSqft ?? region.labourPerSqft ?? 19;
    const miscRate = p.windowLabourSettings?.miscPerSqft ?? region.miscPerSqft ?? 8;
    const labMin = p.windowLabourSettings?.labourMin ?? region.labourMin ?? 325;
    const miscMin = p.windowLabourSettings?.miscMin ?? region.miscMin ?? 74;
    const labRaw = effectiveIsSupplyOnly ? 0 : unitSq * labRate;
    const miscRaw = effectiveIsSupplyOnly ? 0 : unitSq * miscRate;
    const lab = effectiveIsSupplyOnly ? 0 : Math.max(labRaw, labMin) * q;
    const misc = effectiveIsSupplyOnly ? 0 : Math.max(miscRaw, miscMin) * q;
    sq += sqft;
    ln += lin;
    wLab += lab;
    wMisc += misc;
    return { sqft, lin, lab, misc };
  });

  let aLab = 0,
    aMisc = 0;
  if (!effectiveIsSupplyOnly) {
    dbAddons.forEach((a) => {
      const q = Number(addons[a.id]) || 0;
      aLab += q * a.lab;
      aMisc += q * a.misc;
    });
  }

  const isSupply = effectiveIsSupplyOnly;
  const labourWindows = isSupply ? 0 : wLab + aLab;
  const miscTotal = isSupply ? 0 : wMisc + aMisc;

  const km = isSupply ? 0 : Number(manualKm) || 0;
  const hrs = isSupply ? 0 : Number(manualHours) || 0;

  const crewObj = dbCrewRates.find((c) => c.crewSize === crew);
  const crewRate = isSupply ? 0 : crewObj ? crewObj.hourlyRate : 0;

  const vehicle = isSupply ? 0 : km * dbVehicleRate;
  const crewTravel = isSupply ? 0 : hrs * crewRate;
  const setup = isSupply ? 0 : Number(setupFee) || 0;
  const extras = isSupply
    ? 0
    : vehicle + crewTravel + setup + (region.fixedSetupFee || 0) + (region.baseTravelFee || 0);

  const foundJamb = dbJambs.find((j) => j.id === jambId);
  const jRate =
    jambId === 'none'
      ? 0
      : jambId === 'custom'
      ? Number(jambRate) || 0
      : Number(foundJamb?.rate ?? foundJamb?.pricePerFoot ?? 0);
  const foundCasing = dbCasings.find((c) => c.id === casingId);
  const cRate =
    casingId === 'none'
      ? 0
      : casingId === 'custom'
      ? Number(casingRate) || 0
      : Number(foundCasing?.rate ?? foundCasing?.pricePerFoot ?? 0);

  const jambTot = isSupply || jambId === 'none' ? 0 : ln * jRate;
  const casingTot = isSupply || casingId === 'none' ? 0 : ln * cRate;
  const jc = jambTot + casingTot;

  const labourTotal = isSupply ? extras : labourWindows + extras;

  const finalLabour = includeLabour && !isSupply ? labourTotal : 0;
  const finalMisc = includeMisc && !isSupply ? miscTotal : 0;
  const finalJC = includeJC && !isSupply ? jc : 0;

  const disc = Number(discount) || 0;
  const subtotal = finalLabour + finalMisc + finalJC - disc;
  const hst = hstOn ? subtotal * 0.13 : 0;
  const total = subtotal + hst;

  const selectedAddonsList = isSupply
    ? []
    : dbAddons
        .filter((a) => Number(addons[a.id]) > 0)
        .map((a) => {
          const q = Number(addons[a.id]);
          return {
            id: a.id,
            label: a.label.split('@')[0].split('(')[0].trim(),
            qty: q,
            lab: q * a.lab,
            misc: q * a.misc,
          };
        });

  const selectedJambObj =
    jambId !== 'none' && !isSupply
      ? {
          id: jambId,
          name:
            jambId === 'custom'
              ? jambName || 'Custom Jamb'
              : dbJambs.find((j) => j.id === jambId)?.label || 'Jamb',
          rate: jRate,
          total: jambTot,
        }
      : null;

  const selectedCasingObj =
    casingId !== 'none' && !isSupply
      ? {
          id: casingId,
          name:
            casingId === 'custom'
              ? casingName || 'Custom Casing'
              : dbCasings.find((c) => c.id === casingId)?.label || 'Casing',
          rate: cRate,
          total: casingTot,
        }
      : null;

  return {
    sq,
    ln,
    wLab,
    wMisc,
    aLab,
    aMisc,
    labourWindows: isSupply ? 0 : labourWindows,
    miscTotal,
    vehicle,
    crewTravel,
    extras,
    jc,
    labourTotal,
    finalLabour,
    finalMisc,
    finalJC,
    subtotal,
    hst,
    total,
    lines,
    km,
    hrs,
    crew,
    crewRate,
    vehicleRate: dbVehicleRate,
    setup,
    setupFee,
    isSupplyOnly: isSupply,
    isServiceOnly: false,
    selectedAddons: selectedAddonsList,
    addonsMap: addons,
    dbAddons,
    selectedRegionId,
    coords,
    jambId: isSupply ? 'none' : jambId,
    jambRate: isSupply ? 0 : jRate,
    jambName: selectedJambObj?.name || (isSupply ? '' : jambName),
    casingId: isSupply ? 'none' : casingId,
    casingRate: isSupply ? 0 : cRate,
    casingName: selectedCasingObj?.name || (isSupply ? '' : casingName),
    selectedJamb: selectedJambObj,
    selectedCasing: selectedCasingObj,
    discount: disc,
    hstOn: Boolean(hstOn),
    includeLabour,
    includeMisc,
    includeJC,
    regionName: region.name,
    city: travelCity || region.name,
    jcLabourCents: Math.round((finalJC || 0) * 100),
    miscLabourCents: Math.round((finalMisc || 0) * 100),
    standardLabourCents: Math.round((finalLabour || 0) * 100),
    jcTotal: finalJC,
  };
}

