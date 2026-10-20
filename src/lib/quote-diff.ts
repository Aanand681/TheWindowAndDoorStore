/**
 * Pure TypeScript helper to compare an original/baseline quote state with a current state
 * and return human-readable diff bullet points detailing everything that changed.
 * Safe for both Client and Server environments.
 */

export function detectQuoteChanges(original: any, current: any): string[] {
  if (!original || !current) return [];
  const changes: string[] = [];

  // Helper to format dollar numbers
  const fmt = (val: number) => `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // 1. Custom Misc Price Override
  const origCustomMiscStr = original.customMisc !== undefined && original.customMisc !== null ? String(original.customMisc).trim() : '';
  const curCustomMiscStr = current.customMisc !== undefined && current.customMisc !== null ? String(current.customMisc).trim() : '';
  const origCustomMisc = origCustomMiscStr !== '' ? Number(origCustomMiscStr) : null;
  const curCustomMisc = curCustomMiscStr !== '' ? Number(curCustomMiscStr) : null;
  const origTaxMisc = Number(original.taxTotals?.finalMisc ?? original.taxTotals?.miscTotal ?? 0);
  const curTaxMisc = Number(current.taxTotals?.finalMisc ?? current.taxTotals?.miscTotal ?? 0);

  if (curCustomMisc !== null && origCustomMisc === null) {
    changes.push(`Custom Misc price override set to ${fmt(curCustomMisc)} (was calculated as ${fmt(origTaxMisc)})`);
  } else if (curCustomMisc !== null && origCustomMisc !== null && Math.abs(curCustomMisc - origCustomMisc) > 0.01) {
    changes.push(`Custom Misc price updated from ${fmt(origCustomMisc)} to ${fmt(curCustomMisc)}`);
  } else if (curCustomMisc === null && origCustomMisc !== null) {
    changes.push(`Custom Misc override removed (reverted to tax calculation ${fmt(curTaxMisc)})`);
  }

  // 2. Custom JC (Jambs & Casing) Override
  const origCustomJCStr = original.customJC !== undefined && original.customJC !== null ? String(original.customJC).trim() : '';
  const curCustomJCStr = current.customJC !== undefined && current.customJC !== null ? String(current.customJC).trim() : '';
  const origCustomJC = origCustomJCStr !== '' ? Number(origCustomJCStr) : null;
  const curCustomJC = curCustomJCStr !== '' ? Number(curCustomJCStr) : null;
  const origTaxJC = Number(original.taxTotals?.finalJC ?? original.taxTotals?.jcTotal ?? 0);
  const curTaxJC = Number(current.taxTotals?.finalJC ?? current.taxTotals?.jcTotal ?? 0);

  if (curCustomJC !== null && origCustomJC === null) {
    changes.push(`Custom Jambs & Casing override set to ${fmt(curCustomJC)} (was calculated as ${fmt(origTaxJC)})`);
  } else if (curCustomJC !== null && origCustomJC !== null && Math.abs(curCustomJC - origCustomJC) > 0.01) {
    changes.push(`Custom Jambs & Casing updated from ${fmt(origCustomJC)} to ${fmt(curCustomJC)}`);
  } else if (curCustomJC === null && origCustomJC !== null) {
    changes.push(`Custom Jambs & Casing override removed (reverted to calculated ${fmt(curTaxJC)})`);
  }

  // 2b. Jamb Selection & Rate Diff
  const origJambName = (original.taxTotals?.selectedJamb?.name || original.taxTotals?.jambName || (original.taxTotals?.selectedJamb === null ? 'None' : '')).trim();
  const curJambName = (current.taxTotals?.selectedJamb?.name || current.taxTotals?.jambName || (current.taxTotals?.selectedJamb === null ? 'None' : '')).trim();
  if (origJambName && curJambName && origJambName.toLowerCase() !== curJambName.toLowerCase()) {
    changes.push(`Jamb profile changed from "${origJambName}" to "${curJambName}"`);
  }

  const origJambRate = original.taxTotals?.selectedJamb?.rate !== undefined ? Number(original.taxTotals.selectedJamb.rate) : (original.taxTotals?.jambRate !== undefined ? Number(original.taxTotals.jambRate) : null);
  const curJambRate = current.taxTotals?.selectedJamb?.rate !== undefined ? Number(current.taxTotals.selectedJamb.rate) : (current.taxTotals?.jambRate !== undefined ? Number(current.taxTotals.jambRate) : null);
  if (origJambRate !== null && curJambRate !== null && Math.abs(origJambRate - curJambRate) > 0.01) {
    changes.push(`Jamb rate adjusted from ${fmt(origJambRate)} to ${fmt(curJambRate)}`);
  }

  // 2c. Casing Selection & Rate Diff
  const origCasingName = (original.taxTotals?.selectedCasing?.name || original.taxTotals?.casingName || (original.taxTotals?.selectedCasing === null ? 'None' : '')).trim();
  const curCasingName = (current.taxTotals?.selectedCasing?.name || current.taxTotals?.casingName || (current.taxTotals?.selectedCasing === null ? 'None' : '')).trim();
  if (origCasingName && curCasingName && origCasingName.toLowerCase() !== curCasingName.toLowerCase()) {
    changes.push(`Casing profile changed from "${origCasingName}" to "${curCasingName}"`);
  }

  const origCasingRate = original.taxTotals?.selectedCasing?.rate !== undefined ? Number(original.taxTotals.selectedCasing.rate) : (original.taxTotals?.casingRate !== undefined ? Number(original.taxTotals.casingRate) : null);
  const curCasingRate = current.taxTotals?.selectedCasing?.rate !== undefined ? Number(current.taxTotals.selectedCasing.rate) : (current.taxTotals?.casingRate !== undefined ? Number(current.taxTotals.casingRate) : null);
  if (origCasingRate !== null && curCasingRate !== null && Math.abs(origCasingRate - curCasingRate) > 0.01) {
    changes.push(`Casing rate adjusted from ${fmt(origCasingRate)} to ${fmt(curCasingRate)}`);
  }

  // 2d. Calculated J&C Total Diff (when no custom override active)
  if (curCustomJC === null && origCustomJC === null && Math.abs(curTaxJC - origTaxJC) > 1.0 && (origTaxJC > 0 || curTaxJC > 0)) {
    changes.push(`Calculated Jambs & Casing total updated from ${fmt(origTaxJC)} to ${fmt(curTaxJC)}`);
  }

  // 3. Custom Labour Override
  const origCustomLabourStr = original.customLabour !== undefined && original.customLabour !== null ? String(original.customLabour).trim() : '';
  const curCustomLabourStr = current.customLabour !== undefined && current.customLabour !== null ? String(current.customLabour).trim() : '';
  const origCustomLabour = origCustomLabourStr !== '' ? Number(origCustomLabourStr) : null;
  const curCustomLabour = curCustomLabourStr !== '' ? Number(curCustomLabourStr) : null;
  const origTaxLabour = Number(original.taxTotals?.finalLabour ?? original.taxTotals?.labourTotal ?? 0);
  const curTaxLabour = Number(current.taxTotals?.finalLabour ?? current.taxTotals?.labourTotal ?? 0);

  if (curCustomLabour !== null && origCustomLabour === null) {
    changes.push(`Custom Labour override set to ${fmt(curCustomLabour)} (was calculated as ${fmt(origTaxLabour)})`);
  } else if (curCustomLabour !== null && origCustomLabour !== null && Math.abs(curCustomLabour - origCustomLabour) > 0.01) {
    changes.push(`Custom Labour updated from ${fmt(origCustomLabour)} to ${fmt(curCustomLabour)}`);
  } else if (curCustomLabour === null && origCustomLabour !== null) {
    changes.push(`Custom Labour override updated (reverted to calculated ${fmt(curTaxLabour)})`);
  }


  // 4. Base Window Total Price
  const origBase = Number(original.quoteResult?.base ?? 0);
  const curBase = Number(current.quoteResult?.base ?? 0);
  if (origBase > 0 && curBase > 0 && Math.abs(origBase - curBase) > 0) {
    changes.push(`Base window total updated from ${fmt(origBase / 100)} to ${fmt(curBase / 100)}`);
  }

  // 5. Window Items inspection
  const origWindows = Array.isArray(original.windows) ? original.windows : [];
  const curWindows = Array.isArray(current.windows) ? current.windows : [];
  if (origWindows.length > 0 && curWindows.length > 0) {
    if (origWindows.length !== curWindows.length) {
      changes.push(`Window line items changed (${curWindows.length} windows vs ${origWindows.length} originally)`);
    } else {
      origWindows.forEach((ow: any, idx: number) => {
        const cw = curWindows[idx];
        if (!cw) return;
        const owSize = `${ow.w || '0'}" × ${ow.h || '0'}"`;
        const cwSize = `${cw.w || '0'}" × ${cw.h || '0'}"`;
        if (owSize !== cwSize && (ow.w || ow.h || cw.w || cw.h)) {
          changes.push(`Window #${idx + 1} size adjusted from ${owSize} to ${cwSize}`);
        }
        if (String(cw.qty || '') !== String(ow.qty || '')) {
          changes.push(`Window #${idx + 1} qty updated from ${ow.qty || 1} to ${cw.qty || 1}`);
        }
        if (Number(cw.base || 0) !== Number(ow.base || 0) && Number(cw.base || 0) > 0) {
          changes.push(`Window #${idx + 1} base price updated from ${fmt(Number(ow.base || 0))} to ${fmt(Number(cw.base || 0))}`);
        }
      });
    }
  }

  // 6. Travel and Setup
  const origTravel = (Number(original.taxTotals?.vehicle) || 0) + (Number(original.taxTotals?.crewTravel) || 0) + (Number(original.taxTotals?.setup) || 0);
  const curTravel = (Number(current.taxTotals?.vehicle) || 0) + (Number(current.taxTotals?.crewTravel) || 0) + (Number(current.taxTotals?.setup) || 0);
  if (Math.abs(origTravel - curTravel) > 0.5) {
    changes.push(`Travel & Setup fee updated from ${fmt(origTravel)} to ${fmt(curTravel)}`);
  }

  // 7. Addons and Extras (Item-by-Item)
  const origAddons: any[] = Array.isArray(original.taxTotals?.selectedAddons) ? original.taxTotals.selectedAddons : [];
  const curAddons: any[] = Array.isArray(current.taxTotals?.selectedAddons) ? current.taxTotals.selectedAddons : [];

  const origAddonMap = new Map<string, any>();
  origAddons.forEach((a: any) => {
    const key = (a.label || a.name || a.id || '').trim().toLowerCase();
    if (key) origAddonMap.set(key, a);
  });

  const curAddonMap = new Map<string, any>();
  curAddons.forEach((a: any) => {
    const key = (a.label || a.name || a.id || '').trim().toLowerCase();
    if (key) curAddonMap.set(key, a);
  });

  // Check added or updated addons
  curAddons.forEach((ca: any) => {
    const key = (ca.label || ca.name || ca.id || '').trim().toLowerCase();
    const oa = origAddonMap.get(key);
    const label = ca.label || ca.name || 'Add-on';
    if (!oa) {
      const priceVal = Number(ca.total || (ca.lab || 0) + (ca.misc || 0));
      const priceText = priceVal > 0 ? ` (+${fmt(priceVal)})` : '';
      changes.push(`Added Add-on: "${label}" (Qty: ${ca.qty || 1}${priceText})`);
    } else {
      if (Number(ca.qty || 0) !== Number(oa.qty || 0)) {
        changes.push(`Add-on "${label}": Qty updated from ${oa.qty || 1} to ${ca.qty || 1}`);
      } else {
        const caCost = Number(ca.total || (ca.lab || 0) + (ca.misc || 0));
        const oaCost = Number(oa.total || (oa.lab || 0) + (oa.misc || 0));
        if (Math.abs(caCost - oaCost) > 0.5) {
          changes.push(`Add-on "${label}": Price adjusted from ${fmt(oaCost)} to ${fmt(caCost)}`);
        }
      }
    }
  });

  // Check removed addons
  origAddons.forEach((oa: any) => {
    const key = (oa.label || oa.name || oa.id || '').trim().toLowerCase();
    if (!curAddonMap.has(key)) {
      const label = oa.label || oa.name || 'Add-on';
      changes.push(`Removed Add-on: "${label}"`);
    }
  });

  // 8. Surcharge Rate
  if (original.surchargeRate !== undefined && current.surchargeRate !== undefined && Number(original.surchargeRate) !== Number(current.surchargeRate)) {
    changes.push(`Surcharge rate updated from ${original.surchargeRate}% to ${current.surchargeRate}%`);
  }

  // 9. Promotion
  if (original.activePromoId && current.activePromoId && original.activePromoId !== current.activePromoId) {
    changes.push(`Promotion updated to ${current.quoteResult?.promoName || current.activePromoId}`);
  }

  // 10. Discount
  const origDiscount = Number(original.taxTotals?.discount) || 0;
  const curDiscount = Number(current.taxTotals?.discount) || 0;
  if (Math.abs(origDiscount - curDiscount) > 0.01) {
    changes.push(`Discount updated from ${fmt(origDiscount)} to ${fmt(curDiscount)}`);
  }

  // 11. Total Quote Price (Overall Summary - only if no specific itemized change was found)
  const origTotal = Number(original.quoteSummaryTotal ?? 0);
  const curTotal = Number(current.quoteSummaryTotal ?? 0);
  if (changes.length === 0 && origTotal > 0 && curTotal > 0 && Math.abs(origTotal - curTotal) > 0) {
    const diff = (curTotal - origTotal) / 100;
    const sign = diff > 0 ? `+${fmt(diff)}` : `-${fmt(Math.abs(diff))}`;
    changes.push(`Quote Total updated from ${fmt(origTotal / 100)} to ${fmt(curTotal / 100)} (${sign})`);
  }


  return changes;
}
