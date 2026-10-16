"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Calculator, Plus, Trash2, Lock } from 'lucide-react';
import { formatMoney } from '@/lib/promo-logic';
import { toast } from 'sonner';

import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { 
  ssr: false, 
  loading: () => <div className="h-[300px] bg-muted animate-pulse rounded-lg flex items-center justify-center">Loading Map...</div>
});

const ADDONS = [
  { id: 'blinds', label: 'Blinds back on per window @ $60.00', lab: 60, misc: 0 },
  { id: 'drip', label: 'Drip edge install @ $30.00 per window', lab: 30, misc: 6.99 },
  { id: 'base', label: 'Basement windows $100.00 extra', lab: 100, misc: 0 },
  { id: 'stucco', label: 'Cut stucco around NF for BM @ $75', lab: 75, misc: 0 },
  { id: 'siding', label: 'Removal siding per window/door @ $130.00', lab: 130, misc: 0 },
  { id: 'scaf1', label: 'Scaffolding set up 1 section @ $60.00', lab: 60, misc: 0 },
  { id: 'scaf2', label: 'Scaffolding set up 2 sections @ $80.00', lab: 80, misc: 0 },
  { id: 'alum', label: 'Cut aluminum siding for BM @ $450', lab: 450, misc: 0 },
  { id: 'jchan', label: 'J channels (qty × $325 labour + $180 misc)', lab: 325, misc: 180 }
];

const JAMBS = [
  { id: 'j1', label: 'Vinyl Wrapped Jamb – 3/4 x 2 1/2', rate: 5.05 },
  { id: 'j2', label: 'Vinyl Wrapped Jamb – 3/4 x 3 1/4', rate: 6.05 },
  { id: 'j3', label: 'Vinyl Wrapped Jamb – 3/4 x 4 1/2', rate: 7.34 },
  { id: 'j4', label: 'Vinyl Wrapped Jamb – 3/4 x 5 1/4', rate: 8.49 },
  { id: 'j5', label: 'Vinyl Wrapped Jamb – 3/4 x 6 3/4', rate: 10.31 }
];

const CASINGS = [
  { id: 'vinyl', label: 'Vinyl casing charge', rate: 5.69 },
  { id: 'oak', label: 'Oak casing charge', rate: 8.16 }
];

function parseInches(v: string | undefined | null) {
  const s = String(v ?? '').trim().replace(/"/g, '');
  if (!s) return null;
  let m = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (m) return Number(m[1]) + Number(m[2]) / Number(m[3]);
  m = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (m) return Number(m[1]) / Number(m[2]);
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export default function TaxCalculatorTab({ 
  windows, 
  onWindowsChange, 
  onCalculated,
  savedTaxTotals,
  readOnly = false,
}: { 
  windows: any[], 
  onWindowsChange: (w: any[]) => void, 
  onCalculated?: (totals: any) => void,
  savedTaxTotals?: any,
  readOnly?: boolean,
}) {
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');
  
  const [dbAddons, setDbAddons] = useState<any[]>(ADDONS);
  const [dbJambs, setDbJambs] = useState<any[]>(JAMBS);
  const [dbCasings, setDbCasings] = useState<any[]>(CASINGS);
  const [dbVehicleRate, setDbVehicleRate] = useState<number>(0.98);
  const [dbCrewRates, setDbCrewRates] = useState<any[]>([
    { crewSize: '2', hourlyRate: 150 },
    { crewSize: '3', hourlyRate: 200 },
    { crewSize: '4', hourlyRate: 500 }
  ]);

  const [addons, setAddons] = useState<Record<string, string>>({});
  
  // Travel state
  const [coords, setCoords] = useState('');
  const [travelInfo, setTravelInfo] = useState<any>(null);
  const [manualKm, setManualKm] = useState('0');
  const [manualHours, setManualHours] = useState('0');
  const [crew, setCrew] = useState('2');
  const [setupFee, setSetupFee] = useState('0');

  // Jambs & Casing (defaults: Vinyl Wrapped Jamb 3/4 x 4 1/2 and Vinyl casing charge)
  const [jambId, setJambId] = useState('j3');
  const [jambName, setJambName] = useState('');
  const [jambRate, setJambRate] = useState('');
  
  const [casingId, setCasingId] = useState('vinyl');
  const [casingName, setCasingName] = useState('');
  const [casingRate, setCasingRate] = useState('');

  const [discount, setDiscount] = useState('');
  const [hstOn, setHstOn] = useState(true);
  
  // Toggles for Quote Type
  const [includeLabour, setIncludeLabour] = useState(true);
  const [includeMisc, setIncludeMisc] = useState(true);
  const [includeJC, setIncludeJC] = useState(true);

  const handleRegionSelect = (regId: string, currentRegions = regions) => {
    setSelectedRegionId(regId);
    const reg = currentRegions.find(r => r._id === regId);
    if (reg && (reg.name.toLowerCase().includes('dryden') || reg.name.toLowerCase().includes('sioux'))) {
      const std = reg.setupFeeOptions?.find((o: any) => Math.abs(o.value - 727.5) < 0.01);
      setSetupFee(std ? String(std.value) : '727.5');
    } else {
      setSetupFee('0');
    }
  };

  useEffect(() => {
    fetch('/api/regions')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) {
          setRegions(d);
          if (d.length > 0) {
            const ff = d.find((r: any) => r.name.toLowerCase().includes('fort frances'));
            const initial = ff || d[0];
            setSelectedRegionId(initial._id);
            if (initial.name.toLowerCase().includes('dryden') || initial.name.toLowerCase().includes('sioux')) {
              const std = initial.setupFeeOptions?.find((o: any) => Math.abs(o.value - 727.5) < 0.01);
              setSetupFee(std ? String(std.value) : '727.5');
            }
          }
        } else {
          console.error("Regions API returned error:", d);
        }
      })
      .catch(console.error);
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        if (!d || d.error) {
          console.error("Settings API returned error:", d);
          return;
        }
        if (d.addons?.length) {
          setDbAddons(prev => {
            const defaultIds = new Set((d.addons || []).map((x: any) => x.id));
            const customs = prev.filter(p => p.isCustom || !defaultIds.has(p.id));
            return [...(d.addons || []), ...customs];
          });
        }
        if (d.jambs?.length) {
          setDbJambs(d.jambs);
          const targetJamb = d.jambs.find((j: any) => j.id === 'j3' || j.label?.includes('3/4 x 4 1/2'));
          if (targetJamb && !savedTaxTotals) setJambId(targetJamb.id);
        }
        if (d.casings?.length) setDbCasings(d.casings);
        if (d.vehicleRate !== undefined) setDbVehicleRate(d.vehicleRate);
        if (d.crewRates?.length) setDbCrewRates(d.crewRates);
      })
      .catch(console.error);
  }, []);

  // Keep track of quote restoration so we don't clobber in-progress user edits
  const restoredQuoteKeyRef = React.useRef<string | null>(null);

  // Restore saved tax & labour state when reviewing a quote
  useEffect(() => {
    if (!savedTaxTotals) {
      if (restoredQuoteKeyRef.current !== null) {
        // Review mode was exited or reset! Clear all custom extras and restore defaults
        restoredQuoteKeyRef.current = null;
        setAddons({});
        setCoords('');
        setManualKm('0');
        setManualHours('0');
        setCrew('2');
        setSetupFee('0');
        setDiscount('');
        setHstOn(true);
        setIncludeLabour(true);
        setIncludeMisc(true);
        setIncludeJC(true);
        setJambId('j3');
        setCasingId('vinyl');
      }
      return;
    }

    const quoteKey = savedTaxTotals._quoteId || savedTaxTotals._quoteNumber || JSON.stringify({
      reg: savedTaxTotals.selectedRegionId,
      addons: savedTaxTotals.addonsMap,
      selAddonsCount: savedTaxTotals.selectedAddons?.length,
      disc: savedTaxTotals.discount,
      labour: savedTaxTotals.finalLabour,
      jamb: savedTaxTotals.jambId ?? savedTaxTotals.selectedJamb?.id ?? (savedTaxTotals.selectedJamb === null ? 'none' : 'default'),
      casing: savedTaxTotals.casingId ?? savedTaxTotals.selectedCasing?.id ?? (savedTaxTotals.selectedCasing === null ? 'none' : 'default'),
    });

    if (restoredQuoteKeyRef.current === quoteKey) {
      // If region wasn't resolved previously because regions was empty, try matching it now
      if ((!selectedRegionId || selectedRegionId === '') && regions.length > 0) {
        if (savedTaxTotals.selectedRegionId) {
          setSelectedRegionId(savedTaxTotals.selectedRegionId);
        } else if (savedTaxTotals.regionName) {
          const match = regions.find(r => r.name.toLowerCase() === savedTaxTotals.regionName.toLowerCase());
          if (match) setSelectedRegionId(match._id);
        }
      }
      return;
    }
    restoredQuoteKeyRef.current = quoteKey;

    // Restore addonsMap or extract from selectedAddons
    let restoredMap: Record<string, string> = {};
    if (savedTaxTotals.addonsMap && Object.keys(savedTaxTotals.addonsMap).length > 0) {
      restoredMap = { ...savedTaxTotals.addonsMap };
    } else if (savedTaxTotals.selectedAddons && Array.isArray(savedTaxTotals.selectedAddons) && savedTaxTotals.selectedAddons.length > 0) {
      savedTaxTotals.selectedAddons.forEach((sa: any) => {
        if (sa.id) restoredMap[sa.id] = String(sa.qty || '1');
      });
    }
    if (Object.keys(restoredMap).length > 0) {
      setAddons(restoredMap);
    }

    // Restore custom / dbAddons
    if (savedTaxTotals.dbAddons && Array.isArray(savedTaxTotals.dbAddons) && savedTaxTotals.dbAddons.length > 0) {
      setDbAddons(savedTaxTotals.dbAddons);
    } else if (savedTaxTotals.selectedAddons && Array.isArray(savedTaxTotals.selectedAddons)) {
      setDbAddons(prev => {
        const existingIds = new Set(prev.map(p => p.id));
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
      setSelectedRegionId(savedTaxTotals.selectedRegionId);
    } else if (savedTaxTotals.regionName && regions.length > 0) {
      const match = regions.find(r => r.name.toLowerCase() === savedTaxTotals.regionName.toLowerCase());
      if (match) setSelectedRegionId(match._id);
    }

    // Restore jambs and casings (including None and custom overrides)
    if (savedTaxTotals.jambId !== undefined) {
      setJambId(savedTaxTotals.jambId);
    } else if (savedTaxTotals.selectedJamb === null) {
      setJambId('none');
    } else if (savedTaxTotals.selectedJamb?.id) {
      setJambId(savedTaxTotals.selectedJamb.id);
    } else if (savedTaxTotals.jambName || savedTaxTotals.selectedJamb?.name) {
      const targetName = (savedTaxTotals.jambName || savedTaxTotals.selectedJamb?.name || '').toLowerCase();
      const matchJ = dbJambs.find(j => j.label?.toLowerCase() === targetName || j.name?.toLowerCase() === targetName);
      if (matchJ) {
        setJambId(matchJ.id);
      } else {
        setJambId('custom');
        setJambName(savedTaxTotals.jambName || savedTaxTotals.selectedJamb?.name);
      }
    }
    if (savedTaxTotals.jambRate !== undefined) setJambRate(String(savedTaxTotals.jambRate));
    else if (savedTaxTotals.selectedJamb?.rate !== undefined) setJambRate(String(savedTaxTotals.selectedJamb.rate));
    if (savedTaxTotals.jambName) setJambName(savedTaxTotals.jambName);
    else if (savedTaxTotals.selectedJamb?.name) setJambName(savedTaxTotals.selectedJamb.name);

    if (savedTaxTotals.casingId !== undefined) {
      setCasingId(savedTaxTotals.casingId);
    } else if (savedTaxTotals.selectedCasing === null) {
      setCasingId('none');
    } else if (savedTaxTotals.selectedCasing?.id) {
      setCasingId(savedTaxTotals.selectedCasing.id);
    } else if (savedTaxTotals.casingName || savedTaxTotals.selectedCasing?.name) {
      const targetName = (savedTaxTotals.casingName || savedTaxTotals.selectedCasing?.name || '').toLowerCase();
      const matchC = dbCasings.find(c => c.label?.toLowerCase() === targetName || c.name?.toLowerCase() === targetName);
      if (matchC) {
        setCasingId(matchC.id);
      } else {
        setCasingId('custom');
        setCasingName(savedTaxTotals.casingName || savedTaxTotals.selectedCasing?.name);
      }
    }
    if (savedTaxTotals.casingRate !== undefined) setCasingRate(String(savedTaxTotals.casingRate));
    else if (savedTaxTotals.selectedCasing?.rate !== undefined) setCasingRate(String(savedTaxTotals.selectedCasing.rate));
    if (savedTaxTotals.casingName) setCasingName(savedTaxTotals.casingName);
    else if (savedTaxTotals.selectedCasing?.name) setCasingName(savedTaxTotals.selectedCasing.name);

    // Restore travel & extras
    if (savedTaxTotals.coords) setCoords(savedTaxTotals.coords);
    if (savedTaxTotals.manualKm !== undefined) setManualKm(String(savedTaxTotals.manualKm));
    if (savedTaxTotals.manualHours !== undefined) setManualHours(String(savedTaxTotals.manualHours));
    if (savedTaxTotals.crew !== undefined) setCrew(String(savedTaxTotals.crew));
    if (savedTaxTotals.setup !== undefined || savedTaxTotals.setupFee !== undefined) {
      setSetupFee(String(savedTaxTotals.setup ?? savedTaxTotals.setupFee));
    }
    if (savedTaxTotals.discount !== undefined) setDiscount(String(savedTaxTotals.discount));
    if (savedTaxTotals.hstOn !== undefined) setHstOn(Boolean(savedTaxTotals.hstOn));
    if (savedTaxTotals.includeLabour !== undefined) setIncludeLabour(Boolean(savedTaxTotals.includeLabour));
    if (savedTaxTotals.includeMisc !== undefined) setIncludeMisc(Boolean(savedTaxTotals.includeMisc));
    if (savedTaxTotals.includeJC !== undefined) setIncludeJC(Boolean(savedTaxTotals.includeJC));
  }, [savedTaxTotals, regions]);

  const region = regions.find(r => r._id === selectedRegionId);

  const calculate = () => {
    if (!region) return null;
    let sq = 0, ln = 0, wLab = 0, wMisc = 0;
    const lines = windows.map(w => {
      const W = parseInches(w.w), H = parseInches(w.h), q = Number(w.qty) || 0;
      if (!W || !H || q <= 0) return null;
      const unitSq = (W * H) / 144;
      const sqft = unitSq * q;
      const lin = ((W * 2 + H * 2) / 12) * q + q * region.extraLinPerWindow;
      const labRaw = unitSq * region.labourPerSqft;
      const miscRaw = unitSq * region.miscPerSqft;
      const lab = Math.max(labRaw, region.labourMin) * q;
      const misc = Math.max(miscRaw, region.miscMin) * q;
      sq += sqft; ln += lin; wLab += lab; wMisc += misc;
      return { sqft, lin, lab, misc };
    });

    let aLab = 0, aMisc = 0;
    dbAddons.forEach(a => {
      const q = Number(addons[a.id]) || 0;
      aLab += q * a.lab;
      aMisc += q * a.misc;
    });

    const labourWindows = wLab + aLab;
    const miscTotal = wMisc + aMisc;

    const km = Number(manualKm) || 0;
    const hrs = Number(manualHours) || 0;
    
    // Find dynamic crew rate based on selected crew size
    const crewObj = dbCrewRates.find(c => c.crewSize === crew);
    const crewRate = crewObj ? crewObj.hourlyRate : 0;
    
    const vehicle = km * dbVehicleRate;
    const crewTravel = hrs * crewRate;
    const setup = Number(setupFee) || 0;
    const extras = vehicle + crewTravel + setup + region.fixedSetupFee + (region.baseTravelFee || 0);

    const jRate = jambId === 'custom' ? Number(jambRate) || 0 : (dbJambs.find(j => j.id === jambId)?.rate || 0);
    const cRate = casingId === 'custom' ? Number(casingRate) || 0 : (dbCasings.find(c => c.id === casingId)?.rate || 0);
    
    const jambTot = ln * jRate;
    const casingTot = ln * cRate;
    const jc = jambTot + casingTot;

    const labourTotal = labourWindows + extras;
    
    const finalLabour = includeLabour ? labourTotal : 0;
    const finalMisc = includeMisc ? miscTotal : 0;
    const finalJC = includeJC ? jc : 0;
    
    const disc = Number(discount) || 0;
    const subtotal = finalLabour + finalMisc + finalJC - disc;
    const hst = hstOn ? subtotal * 0.13 : 0;
    const total = subtotal + hst;

    const selectedAddonsList = dbAddons
      .filter(a => Number(addons[a.id]) > 0)
      .map(a => {
        const q = Number(addons[a.id]);
        return {
          id: a.id,
          label: a.label.split('@')[0].split('(')[0].trim(),
          qty: q,
          lab: q * a.lab,
          misc: q * a.misc,
        };
      });

    const selectedJambObj = jambId !== 'none' ? {
      id: jambId,
      name: jambId === 'custom' ? (jambName || 'Custom Jamb') : (dbJambs.find(j => j.id === jambId)?.label || 'Jamb'),
      rate: jRate,
      total: jambTot
    } : null;

    const selectedCasingObj = casingId !== 'none' ? {
      id: casingId,
      name: casingId === 'custom' ? (casingName || 'Custom Casing') : (dbCasings.find(c => c.id === casingId)?.label || 'Casing'),
      rate: cRate,
      total: casingTot
    } : null;

    return { 
      sq, ln, wLab, wMisc, aLab, aMisc, labourWindows, miscTotal, vehicle, crewTravel, extras, jc, labourTotal, finalLabour, finalMisc, finalJC, subtotal, hst, total, lines,
      km,
      hrs,
      crew,
      crewRate,
      vehicleRate: dbVehicleRate,
      setup,
      setupFee,
      fixedSetupFee: region.fixedSetupFee,
      baseTravelFee: region.baseTravelFee || 0,
      selectedAddons: selectedAddonsList,
      addonsMap: addons,
      dbAddons,
      selectedRegionId,
      coords,
      jambId,
      jambRate: jRate,
      jambName: selectedJambObj?.name || jambName,
      casingId,
      casingRate: cRate,
      casingName: selectedCasingObj?.name || casingName,
      selectedJamb: selectedJambObj,
      selectedCasing: selectedCasingObj,
      discount: disc,
      hstOn,
      includeLabour,
      includeMisc,
      includeJC,
      regionName: region.name,
      city: travelInfo?.city || region.name
    };
  };

  const c = useMemo(() => calculate(), [windows, region, addons, manualKm, manualHours, crew, setupFee, jambId, jambRate, casingId, casingRate, discount, hstOn, includeLabour, includeMisc, includeJC, dbAddons, dbJambs, dbCasings, dbVehicleRate, dbCrewRates]);

  useEffect(() => {
    if (onCalculated && c) {
      onCalculated(c);
    }
  }, [c, onCalculated]);

  const isPointInPolygon = (point: {lat: number, lng: number}, vs: {lat: number, lng: number}[]) => {
    let x = point.lng, y = point.lat;
    let inside = false;
    if (!vs || vs.length < 3) return false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      let xi = vs[i].lng, yi = vs[i].lat;
      let xj = vs[j].lng, yj = vs[j].lat;
      let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const calculateTravelFromCoords = async (lat: number, lon: number) => {
    const pt = { lat, lon, city: 'Custom Coordinates', label: `Coordinates ${lat}, ${lon}` };

    try {
      let isFree = false;
      let geofenced = false;
      
      // First check geofence polygon!
      if (region.polygon && region.polygon.length > 2 && isPointInPolygon({ lat, lng: lon }, region.polygon)) {
        isFree = true;
        geofenced = true;
      } else if (region?.freeCities?.some((c: string) => c.toLowerCase() === pt.city.toLowerCase())) {
        isFree = true;
      }

      toast.info("Calculating route...");
      const rt = await fetch(`/api/route?lon=${pt.lon}&lat=${pt.lat}&officeLon=${region.officeLon}&officeLat=${region.officeLat}`);
      if (!rt.ok) throw new Error((await rt.json()).error);
      const rData = await rt.json();
      
      setTravelInfo({ ...pt, ...rData, isFree });

      if (region?.name?.toLowerCase().includes('dryden') || region?.name?.toLowerCase().includes('sioux')) {
        setSetupFee('727.5');
      }
      
      if (isFree) {
        setManualKm('0');
        setManualHours('0');
        if (geofenced) toast.success("Inside City Boundary (No extra travel fee)!");
      } else {
        const roundKm = rData.km * 2;
        const roundHrs = Math.ceil(((rData.seconds * 2) / 3600) * 4) / 4;
        setManualKm(roundKm.toFixed(1));
        setManualHours(roundHrs.toFixed(2));
        toast.success("Calculated extra route from city center!");
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (!region) return <div>Loading region data...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {readOnly && (
        <div className="lg:col-span-12 bg-amber-500/10 border-2 border-amber-500/30 rounded-xl p-3.5 flex items-center gap-2.5 text-xs font-semibold text-amber-700 dark:text-amber-300 animate-in fade-in">
          <Lock className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>Tax &amp; Labour Calculator is in Read-Only Mode. Values and extras are locked and cannot be edited.</span>
        </div>
      )}
      <div className="lg:col-span-8 space-y-8">
        
        <Card>
          <CardHeader>
            <CardTitle>Region Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Select disabled={readOnly} value={selectedRegionId || undefined} onValueChange={val => handleRegionSelect(val ?? '')}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Select Region">
                  {regions.find(r => r._id === selectedRegionId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {regions.map(r => <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-2">
              Free travel within: {region.freeCities.join(', ')}. Base labour ${region.labourPerSqft.toFixed(2)}/sqft.
            </p>
          </CardContent>
        </Card>

        {/* Windows List */}
        <Card>
          <CardHeader>
            <CardTitle>Windows Sizes & Labour</CardTitle>
            <CardDescription>Sizes accepted in inches (e.g. 61 1/4 or 61.25). You can edit width and height here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full max-h-[500px] overflow-auto border rounded-xl bg-background/50">
              <div className="text-[11px] text-muted-foreground/80 md:hidden px-4 py-2 bg-muted/30 border-b border-border/40 font-medium">
                ← Swipe horizontally to edit sizes &amp; view labour →
              </div>
              <div className="space-y-3 p-4 min-w-[700px]">
                {windows.map((w, i) => {
                  const line = c?.lines[i];
                  return (
                    <div key={w.id} className="grid grid-cols-12 gap-4 items-center bg-card p-3 rounded-xl border border-border/80 shadow-sm">
                      <div className="col-span-1 text-center font-mono text-muted-foreground">{i + 1}</div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs text-muted-foreground">Width"</Label>
                        <Input disabled={readOnly} className="h-9" value={w.w || ''} onChange={e => {
                          const nw = [...windows]; nw[i].w = e.target.value.replace(/[^0-9\s./]/g, ''); onWindowsChange(nw);
                        }} />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs text-muted-foreground">Height"</Label>
                        <Input disabled={readOnly} className="h-9" value={w.h || ''} onChange={e => {
                          const nw = [...windows]; nw[i].h = e.target.value.replace(/[^0-9\s./]/g, ''); onWindowsChange(nw);
                        }} />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs text-muted-foreground">Qty</Label>
                        <Input disabled={readOnly} type="number" min="1" className="h-9" value={w.qty} onChange={e => {
                          const nw = [...windows]; nw[i].qty = e.target.value; onWindowsChange(nw);
                        }} />
                      </div>
                      <div className="col-span-4 text-xs space-y-1 mt-4">
                        {line ? (
                          <>
                            <div className="text-muted-foreground font-medium">Sqft: {line.sqft.toFixed(2)} | LinFt: {line.lin.toFixed(2)}</div>
                            <div className="font-semibold text-primary">Lab: {formatMoney(line.lab * 100)} | Misc: {formatMoney(line.misc * 100)}</div>
                          </>
                        ) : (
                          <div className="text-muted-foreground italic">Invalid size</div>
                        )}
                      </div>
                      <div className="col-span-1">
                        <Button disabled={readOnly} variant="ghost" size="icon" className="text-destructive mt-4 hover:bg-destructive/10" onClick={() => {
                          const nw = windows.filter((_, idx) => idx !== i);
                          onWindowsChange(nw.length ? nw : [{ id: Math.random().toString(), qty: '1', base: '', argon: '', solar: '', triple: '', w: '', h: '' }]);
                        }}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <Button disabled={readOnly} variant="secondary" onClick={() => onWindowsChange([...windows, { id: Math.random().toString(), qty: '1', base: '', argon: '', solar: '', triple: '', w: '', h: '' }])}>
              <Plus className="w-4 h-4 mr-2" /> Add Window Manually
            </Button>
          </CardContent>
        </Card>

        {/* Travel and Map */}
        <Card>
          <CardHeader>
            <CardTitle>Travel & Set-up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label>Paste Coordinates / Google Maps link</Label>
                <div className="flex gap-2">
                  <Input disabled={readOnly} value={coords} onChange={e => setCoords(e.target.value)} placeholder="48.6094, -93.4108" />
                  <Button disabled={readOnly} variant="secondary" onClick={() => {
                    const cMatch = coords.match(/(-?\d+\.\d+)[\s,]+(-?\d+\.\d+)/);
                    if (cMatch) {
                       calculateTravelFromCoords(Number(cMatch[1]), Number(cMatch[2])); 
                    } else {
                       toast.error("Invalid coordinates format. Use e.g. 48.6094, -93.4108");
                    }
                  }}>Calculate Travel</Button>
                </div>
              </div>
            </div>

            {travelInfo && (
              <div className={`p-4 rounded-lg border ${travelInfo.isFree ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-primary/10 border-primary/20'}`}>
                <div className="font-semibold">{travelInfo.label}</div>
                <div className="text-sm mt-1">
                  City matched: <b>{travelInfo.city}</b>.
                  {travelInfo.isFree 
                    ? ` This is within ${region.name}'s free zone. No travel charged.` 
                    : ` Outside free zone. One way is ${(travelInfo.km).toFixed(1)} km. Round trip charged.`}
                </div>
              </div>
            )}

            <div className="border border-border rounded-lg overflow-hidden h-[300px] z-0 relative">
              <MapComponent 
                lat={travelInfo?.lat || region.officeLat} 
                lon={travelInfo?.lon || region.officeLon} 
                markerLat={travelInfo?.lat}
                markerLon={travelInfo?.lon}
                polygon={region.polygon}
                onMarkerDragEnd={(lat, lon) => {
                  setCoords(`${lat}, ${lon}`);
                  calculateTravelFromCoords(lat, lon);
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Round-trip km</Label>
                <Input disabled={readOnly} type="number" value={manualKm === '0' ? '' : manualKm} onChange={e => setManualKm(e.target.value.replace(/^0+(?=\d)/, ''))} />
              </div>
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label>Crew</Label>
                <Select disabled={readOnly} value={crew} onValueChange={val => setCrew(val ?? '')}>
                  <SelectTrigger className="w-full text-base py-6 font-medium border-2 border-primary/20 hover:border-primary/50 transition-colors bg-primary/5">
                    <SelectValue placeholder="Select crew size" />
                  </SelectTrigger>
                  <SelectContent>
                    {dbCrewRates.map(cr => (
                      <SelectItem key={cr.crewSize} value={cr.crewSize}>{cr.crewSize} men @ ${cr.hourlyRate}/hr</SelectItem>
                    ))}
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Round-trip hours</Label>
                <Input disabled={readOnly || crew === 'none'} type="number" value={manualHours === '0' ? '' : manualHours} onChange={e => setManualHours(e.target.value.replace(/^0+(?=\d)/, ''))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Per-job set-up fee (Region Specific)</Label>
              <Select disabled={readOnly} value={setupFee} onValueChange={val => setSetupFee(val ?? '')}>
                <SelectTrigger className="w-full sm:w-[350px]">
                  <SelectValue>
                    {region.setupFeeOptions.find((o: any) => String(o.value) === setupFee)?.label || "Select Setup Fee"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="min-w-[350px]">
                  {region.setupFeeOptions.map((opt: any) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">An additional fixed "All Job Set Up Fee" of ${region.fixedSetupFee} is always included.</p>
            </div>
          </CardContent>
        </Card>

        {/* Extras and J&C */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader><CardTitle>Extras</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {dbAddons.map((a: any, index: number) => (
                <div key={a.id} className="flex justify-between items-center gap-4">
                  {a.isCustom ? (
                    <div className="flex-1 space-y-2">
                      <Input disabled={readOnly} placeholder="Description" className="h-8" value={a.label} onChange={e => {
                        const newDb = [...dbAddons];
                        newDb[index].label = e.target.value;
                        setDbAddons(newDb);
                      }} />
                      <div className="flex gap-2">
                        <Input disabled={readOnly} type="number" placeholder="Lab $" className="h-8 w-24" value={a.lab || ''} onChange={e => {
                          const newDb = [...dbAddons];
                          newDb[index].lab = Number(e.target.value);
                          setDbAddons(newDb);
                          if (!addons[a.id] || addons[a.id] === '0') {
                            setAddons(prev => ({ ...prev, [a.id]: '1' }));
                          }
                        }} />
                        <Input disabled={readOnly} type="number" placeholder="Misc $" className="h-8 w-24" value={a.misc || ''} onChange={e => {
                          const newDb = [...dbAddons];
                          newDb[index].misc = Number(e.target.value);
                          setDbAddons(newDb);
                          if (!addons[a.id] || addons[a.id] === '0') {
                            setAddons(prev => ({ ...prev, [a.id]: '1' }));
                          }
                        }} />
                      </div>
                    </div>
                  ) : (
                    <Label className="text-xs flex-1">{a.label}</Label>
                  )}
                  <div className="flex items-center gap-2">
                    <Input 
                      disabled={readOnly}
                      type="number" 
                      className="w-20" 
                      placeholder={a.isCustom ? "1" : "Qty"} 
                      min="0" 
                      value={addons[a.id] || ''} 
                      onChange={e => setAddons({...addons, [a.id]: e.target.value})} 
                    />
                    {!readOnly && a.isCustom && (
                      <Button variant="ghost" size="icon" className="text-destructive h-9" onClick={() => {
                        setDbAddons(dbAddons.filter(item => item.id !== a.id));
                        const newAddonsMap = {...addons};
                        delete newAddonsMap[a.id];
                        setAddons(newAddonsMap);
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {!readOnly && (
                <Button variant="outline" size="sm" className="w-full mt-2 border-dashed" onClick={() => {
                  const newId = 'custom_' + Date.now();
                  setDbAddons([...dbAddons, { id: newId, label: '', lab: 0, misc: 0, isCustom: true }]);
                  setAddons(prev => ({ ...prev, [newId]: '1' }));
                }}>
                  <Plus className="w-4 h-4 mr-2" /> Add Custom Extra (This Session Only)
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jambs & Casing</CardTitle>
              <CardDescription>Priced on total linear ft: {c?.ln.toFixed(2)} ft</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Jamb</Label>
                <Select disabled={readOnly} value={jambId} onValueChange={val => setJambId(val ?? '')}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {jambId === 'none' ? 'None' : jambId === 'custom' ? 'Custom...' : dbJambs.find(j => j.id === jambId)?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="min-w-[280px]">
                    <SelectItem value="none">None</SelectItem>
                    {dbJambs.map(j => <SelectItem key={j.id} value={j.id}>{j.label}</SelectItem>)}
                    <SelectItem value="custom">Custom...</SelectItem>
                  </SelectContent>
                </Select>
                {jambId === 'custom' && (
                  <div className="flex gap-2 mt-2">
                    <Input disabled={readOnly} placeholder="Name" value={jambName} onChange={e => setJambName(e.target.value)} />
                    <Input disabled={readOnly} placeholder="Rate/ft" type="number" value={jambRate} onChange={e => setJambRate(e.target.value)} />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Casing</Label>
                <Select disabled={readOnly} value={casingId} onValueChange={val => setCasingId(val ?? '')}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {casingId === 'none' ? 'None' : casingId === 'custom' ? 'Custom...' : dbCasings.find(c => c.id === casingId)?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="min-w-[280px]">
                    <SelectItem value="none">None</SelectItem>
                    {dbCasings.map(j => <SelectItem key={j.id} value={j.id}>{j.label}</SelectItem>)}
                    <SelectItem value="custom">Custom...</SelectItem>
                  </SelectContent>
                </Select>
                {casingId === 'custom' && (
                  <div className="flex gap-2 mt-2">
                    <Input disabled={readOnly} placeholder="Name" value={casingName} onChange={e => setCasingName(e.target.value)} />
                    <Input disabled={readOnly} placeholder="Rate/ft" type="number" value={casingRate} onChange={e => setCasingRate(e.target.value)} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Sidebar Summary */}
      <div className="lg:col-span-4 space-y-6 sticky top-8 h-fit pb-12">
        <Card className="bg-card/80 border-border backdrop-blur-xl shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Tax & Labour Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {c ? (
              <>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Checkbox disabled={readOnly} id="incLab" checked={includeLabour} onCheckedChange={(ch) => setIncludeLabour(!!ch)} />
                      <Label htmlFor="incLab" className="cursor-pointer font-normal">Labour (windows + extras)</Label>
                    </div>
                    <span className={`font-mono ${!includeLabour ? 'line-through opacity-50' : 'text-foreground'}`}>
                      {formatMoney(c.labourTotal * 100)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Checkbox disabled={readOnly} id="incMisc" checked={includeMisc} onCheckedChange={(ch) => setIncludeMisc(!!ch)} />
                      <Label htmlFor="incMisc" className="cursor-pointer font-normal">Miscellaneous</Label>
                    </div>
                    <span className={`font-mono ${!includeMisc ? 'line-through opacity-50' : 'text-foreground'}`}>
                      {formatMoney(c.miscTotal * 100)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Checkbox disabled={readOnly} id="incJC" checked={includeJC} onCheckedChange={(ch) => setIncludeJC(!!ch)} />
                      <Label htmlFor="incJC" className="cursor-pointer font-normal">Jambs + casings</Label>
                    </div>
                    <span className={`font-mono ${!includeJC ? 'line-through opacity-50' : 'text-foreground'}`}>
                      {formatMoney(c.jc * 100)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 pt-3 border-t border-border">
                    <Label>Monthly discount</Label>
                    <div className="relative w-24">
                      <span className="absolute left-2 top-2 text-muted-foreground text-xs">$</span>
                      <Input disabled={readOnly} type="number" className="h-8 pl-5" value={discount} onChange={e => setDiscount(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold">Subtotal</span>
                    <span className="font-mono font-medium text-lg">{formatMoney(c.subtotal * 100)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox disabled={readOnly} id="hston" checked={hstOn} onCheckedChange={(ch) => setHstOn(!!ch)} />
                      <Label htmlFor="hston" className="cursor-pointer">HST (13%)</Label>
                    </div>
                    <span className="font-mono text-muted-foreground">{formatMoney(c.hst * 100)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-3xl font-bold font-mono tracking-tight text-primary">
                      {formatMoney(c.total * 100)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Enter valid window sizes to see the summary.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
