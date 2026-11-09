import { useState, useRef, useEffect, useCallback } from 'react';

export interface UseCalculatorSupplyModeProps {
  taxTotals: any;
  setTaxTotals: React.Dispatch<React.SetStateAction<any>>;
  setCustomJC: (val: string) => void;
  setHstRate: (rate: number) => void;
  setAttachedUpgrade: (upgrade: any) => void;
}

export function useCalculatorSupplyMode({
  taxTotals,
  setTaxTotals,
  setCustomJC,
  setHstRate,
  setAttachedUpgrade,
}: UseCalculatorSupplyModeProps) {
  const [isSupplyOnly, setIsSupplyOnly] = useState<boolean>(false);
  const [isServiceOnly, setIsServiceOnly] = useState<boolean>(false);
  const [supplyJambId, setSupplyJambId] = useState<string>('none');
  const [supplyJambName, setSupplyJambName] = useState<string>('');
  const [supplyJambRate, setSupplyJambRate] = useState<string>('');
  const [supplyCasingId, setSupplyCasingId] = useState<string>('none');
  const [supplyCasingName, setSupplyCasingName] = useState<string>('');
  const [supplyCasingRate, setSupplyCasingRate] = useState<string>('');

  const lastInstallJambRef = useRef<string>('j3');
  const lastInstallCasingRef = useRef<string>('vinyl');
  const lastInstallSnapshotRef = useRef<any>(null);

  const handleToggleSupplyOnly = useCallback((isSupply: boolean) => {
    setIsSupplyOnly(isSupply);
    if (isSupply) {
      setIsServiceOnly(false);
      setCustomJC('');
      setSupplyJambId('none');
      setSupplyCasingId('none');
      setSupplyJambName('');
      setSupplyJambRate('');
      setSupplyCasingName('');
      setSupplyCasingRate('');
      setTaxTotals((prev: any) => {
        const current = prev || {};
        if (!current.isSupplyOnly) {
          lastInstallSnapshotRef.current = current;
        }
        if (current.selectedJamb?.id && current.selectedJamb.id !== 'none') {
          lastInstallJambRef.current = current.selectedJamb.id;
        } else if (current.jambId && current.jambId !== 'none') {
          lastInstallJambRef.current = current.jambId;
        }
        if (current.selectedCasing?.id && current.selectedCasing.id !== 'none') {
          lastInstallCasingRef.current = current.selectedCasing.id;
        } else if (current.casingId && current.casingId !== 'none') {
          lastInstallCasingRef.current = current.casingId;
        }

        return {
          ...current,
          isSupplyOnly: true,
          isServiceOnly: false,
          standardLabourCents: 0,
          miscLabourCents: 0,
          finalLabour: 0,
          finalMisc: 0,
          jc: 0,
          finalJC: 0,
          jcLabourCents: 0,
          selectedJamb: null,
          selectedCasing: null,
          jambId: 'none',
          casingId: 'none',
          jambRate: 0,
          casingRate: 0,
          jambTot: 0,
          casingTot: 0,
        };
      });
    } else {
      setCustomJC('');
      setSupplyJambId('none');
      setSupplyCasingId('none');
      setTaxTotals((prev: any) => {
        const snapshot = lastInstallSnapshotRef.current;
        if (snapshot) {
          return {
            ...snapshot,
            isSupplyOnly: false,
            isServiceOnly: false,
            jambId: snapshot.jambId || lastInstallJambRef.current || 'j3',
            casingId: snapshot.casingId || lastInstallCasingRef.current || 'vinyl',
          };
        }
        const current = prev || {};
        return {
          ...current,
          isSupplyOnly: false,
          isServiceOnly: false,
          jambId: lastInstallJambRef.current || 'j3',
          casingId: lastInstallCasingRef.current || 'vinyl',
          standardLabourCents: current.standardLabourCents ?? 0,
          miscLabourCents: current.miscLabourCents ?? 0,
          finalLabour: current.finalLabour ?? 0,
          finalMisc: current.finalMisc ?? 0,
          jc: current.jc ?? 0,
          finalJC: current.finalJC ?? 0,
          jcLabourCents: current.jcLabourCents ?? 0,
          selectedJamb: current.selectedJamb ?? null,
          selectedCasing: current.selectedCasing ?? null,
          jambRate: current.jambRate ?? 0,
          casingRate: current.casingRate ?? 0,
          jambTot: current.jambTot ?? 0,
          casingTot: current.casingTot ?? 0,
        };
      });
    }
  }, [setCustomJC, setTaxTotals]);

  const handleModeChange = useCallback((mode: 'installation' | 'supply_only' | 'service_only') => {
    if (mode === 'supply_only') {
      handleToggleSupplyOnly(true);
    } else if (mode === 'service_only') {
      setIsSupplyOnly(false);
      setIsServiceOnly(true);
      setHstRate(13);
      setTaxTotals((prev: any) => {
        if (!prev) return { isSupplyOnly: false, isServiceOnly: true, jc: 0, finalJC: 0 };
        return { ...prev, isSupplyOnly: false, isServiceOnly: true };
      });
    } else {
      setIsServiceOnly(false);
      handleToggleSupplyOnly(false);
    }
  }, [handleToggleSupplyOnly, setHstRate, setTaxTotals]);

  const handleSupplyJCCalculated = useCallback((data: {
    linearFeet: number;
    jambTotCents: number;
    casingTotCents: number;
    jcTotalCents: number;
    selectedJamb: any;
    selectedCasing: any;
  }) => {
    if (!isSupplyOnly) return;
    setTaxTotals((prev: any) => {
      if (
        prev?.isSupplyOnly &&
        prev?.jcLabourCents === data.jcTotalCents &&
        prev?.ln === data.linearFeet &&
        prev?.selectedJamb?.id === data.selectedJamb?.id &&
        prev?.selectedCasing?.id === data.selectedCasing?.id
      ) {
        return prev;
      }
      return {
        ...prev,
        isSupplyOnly: true,
        standardLabourCents: 0,
        miscLabourCents: 0,
        finalLabour: 0,
        finalMisc: 0,
        ln: data.linearFeet,
        jc: data.jcTotalCents / 100,
        finalJC: data.jcTotalCents / 100,
        jcLabourCents: data.jcTotalCents,
        selectedJamb: data.selectedJamb,
        selectedCasing: data.selectedCasing,
      };
    });
  }, [isSupplyOnly, setTaxTotals]);

  // Restore Supply Only state when opening a saved/reviewed quote
  useEffect(() => {
    if (taxTotals?.isSupplyOnly) {
      setIsSupplyOnly(true);
      if (taxTotals.selectedJamb) {
        setSupplyJambId(taxTotals.selectedJamb.id || 'none');
        if (taxTotals.selectedJamb.id === 'custom') {
          setSupplyJambName(taxTotals.selectedJamb.name || '');
          setSupplyJambRate(String(taxTotals.selectedJamb.rate || ''));
        }
      }
      if (taxTotals.selectedCasing) {
        setSupplyCasingId(taxTotals.selectedCasing.id || 'none');
        if (taxTotals.selectedCasing.id === 'custom') {
          setSupplyCasingName(taxTotals.selectedCasing.name || '');
          setSupplyCasingRate(String(taxTotals.selectedCasing.rate || ''));
        }
      }
      if (taxTotals.attachedUpgrade) {
        setAttachedUpgrade(taxTotals.attachedUpgrade);
      }
    }
  }, [taxTotals?._quoteId]);

  const resetSupplyMode = useCallback(() => {
    setIsSupplyOnly(false);
    setIsServiceOnly(false);
    setSupplyJambId('none');
    setSupplyJambName('');
    setSupplyJambRate('');
    setSupplyCasingId('none');
    setSupplyCasingName('');
    setSupplyCasingRate('');
    lastInstallJambRef.current = 'j3';
    lastInstallCasingRef.current = 'vinyl';
    lastInstallSnapshotRef.current = null;
  }, []);

  return {
    isSupplyOnly,
    setIsSupplyOnly,
    isServiceOnly,
    setIsServiceOnly,
    supplyJambId,
    setSupplyJambId,
    supplyJambName,
    setSupplyJambName,
    supplyJambRate,
    setSupplyJambRate,
    supplyCasingId,
    setSupplyCasingId,
    supplyCasingName,
    setSupplyCasingName,
    supplyCasingRate,
    setSupplyCasingRate,
    handleToggleSupplyOnly,
    handleModeChange,
    handleSupplyJCCalculated,
    resetSupplyMode,
  };
}

