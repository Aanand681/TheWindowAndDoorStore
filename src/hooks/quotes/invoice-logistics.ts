export function getInvoiceTravelItems({
  isWindowHost,
  taxTotals,
  regionName,
  isDoorHost,
  effectiveDoorTotals,
  isSUHost,
  effectiveSUTotals,
}: {
  isWindowHost: boolean;
  taxTotals: any;
  regionName?: string;
  isDoorHost: boolean;
  effectiveDoorTotals: any;
  isSUHost: boolean;
  effectiveSUTotals: any;
}): { label: string; amount: number }[] {
  const travelItems: { label: string; amount: number }[] = [];

  if (isWindowHost && taxTotals) {
    if (taxTotals.km > 0) {
      travelItems.push({
        label: `Vehicle travel (${taxTotals.km} km @ $${taxTotals.vehicleRate?.toFixed(2) || '0.98'}/km)`,
        amount: (taxTotals.vehicle || 0) * 100,
      });
    }
    if (taxTotals.hrs > 0 && taxTotals.crew && taxTotals.crew !== 'none') {
      travelItems.push({
        label: `Crew travel (${taxTotals.crew} crew × ${taxTotals.hrs}h @ $${taxTotals.crewRate || 0}/h)`,
        amount: (taxTotals.crewTravel || 0) * 100,
      });
    }
    if (taxTotals.setup > 0) {
      travelItems.push({
        label: 'Per-job set-up fee',
        amount: (taxTotals.setup || 0) * 100,
      });
    }
    if (taxTotals.fixedSetupFee > 0) {
      travelItems.push({
        label: `Job Set Up Fee (${regionName || 'Standard'})`,
        amount: (taxTotals.fixedSetupFee || 0) * 100,
      });
    }
    if (taxTotals.baseTravelFee > 0) {
      travelItems.push({
        label: 'Base travel fee',
        amount: (taxTotals.baseTravelFee || 0) * 100,
      });
    }
  } else if (isDoorHost && effectiveDoorTotals) {
    if ((effectiveDoorTotals.baseSetupFee || 0) > 0) {
      travelItems.push({
        label: 'Per-job set-up fee',
        amount: Math.round((effectiveDoorTotals.baseSetupFee || 0) * 100),
      });
    }
    if ((effectiveDoorTotals.additionalFarFee || 0) > 0) {
      travelItems.push({
        label: 'Remote Area Travel / Setup Surcharge',
        amount: Math.round((effectiveDoorTotals.additionalFarFee || 0) * 100),
      });
    }
    if ((effectiveDoorTotals.vehicleTravelFee || 0) > 0) {
      travelItems.push({
        label: 'Vehicle travel',
        amount: Math.round((effectiveDoorTotals.vehicleTravelFee || 0) * 100),
      });
    }
    if ((effectiveDoorTotals.crewTravelFee || 0) > 0) {
      travelItems.push({
        label: 'Crew travel',
        amount: Math.round((effectiveDoorTotals.crewTravelFee || 0) * 100),
      });
    }
  } else if (isSUHost && effectiveSUTotals) {
    if ((effectiveSUTotals.baseSetupFee || 0) > 0) {
      travelItems.push({
        label: 'Per-job set-up fee',
        amount: Math.round((effectiveSUTotals.baseSetupFee || 0) * 100),
      });
    }
    if ((effectiveSUTotals.additionalFarFee || 0) > 0) {
      travelItems.push({
        label: 'Remote Area Travel / Setup Surcharge',
        amount: Math.round((effectiveSUTotals.additionalFarFee || 0) * 100),
      });
    }
    if ((effectiveSUTotals.vehicleTravelFee || 0) > 0) {
      travelItems.push({
        label: 'Vehicle travel',
        amount: Math.round((effectiveSUTotals.vehicleTravelFee || 0) * 100),
      });
    }
    if ((effectiveSUTotals.crewTravelFee || 0) > 0) {
      travelItems.push({
        label: 'Crew travel',
        amount: Math.round((effectiveSUTotals.crewTravelFee || 0) * 100),
      });
    }
  }

  return travelItems;
}

export function getInvoiceDetailedExtrasList(extrasList: any[]): {
  key: string;
  label: string;
  qty: number;
  amount: number;
}[] {
  const detailedExtrasList: { key: string; label: string; qty: number; amount: number }[] = [];

  extrasList.forEach((a: any, idx: number) => {
    const labCents = Math.round((Number(a.lab) || 0) * 100);
    const miscCents = Math.round((Number(a.misc) || 0) * 100);

    if (labCents > 0 && miscCents > 0) {
      detailedExtrasList.push({
        key: `${a.id || idx}-lab`,
        label: `${a.label} — Labour`,
        qty: a.qty || 1,
        amount: labCents,
      });
      detailedExtrasList.push({
        key: `${a.id || idx}-misc`,
        label: `${a.label} — Materials / Misc`,
        qty: a.qty || 1,
        amount: miscCents,
      });
    } else if (labCents > 0) {
      detailedExtrasList.push({
        key: `${a.id || idx}-lab`,
        label: `${a.label} — Labour`,
        qty: a.qty || 1,
        amount: labCents,
      });
    } else if (miscCents > 0) {
      detailedExtrasList.push({
        key: `${a.id || idx}-misc`,
        label: `${a.label} — Materials / Misc`,
        qty: a.qty || 1,
        amount: miscCents,
      });
    } else {
      const combinedCents = Math.round(((Number(a.lab) || 0) + (Number(a.misc) || 0)) * 100);
      detailedExtrasList.push({
        key: `${a.id || idx}-all`,
        label: a.label,
        qty: a.qty || 1,
        amount: combinedCents,
      });
    }
  });

  return detailedExtrasList;
}

