import {
  DoorPreset,
  DoorUpchargeConfig,
  DoorFormulaSettings,
  DoorLogisticsSettings,
  IDoorSettingsData,
} from './types';

export const DEFAULT_DOOR_PRESETS: DoorPreset[] = [
  {
    id: 'single_regular',
    label: 'Single Door Regular Height',
    category: 'entry',
    labour: 715.0,
    misc: 115.2,
    description: 'Steel Single Entry Door',
  },
  {
    id: 'single_extra_height',
    label: 'Single Door with Extra Height',
    category: 'entry',
    labour: 775.0,
    misc: 115.2,
    description: 'Steel Single Entry Door',
  },
  {
    id: 'door_1_sidelite',
    label: 'Door with 1 Sidelite',
    category: 'entry',
    labour: 1040.0,
    misc: 153.6,
    description: 'Steel Single Entry door with one sidelite',
  },
  {
    id: 'door_2_sidelites',
    label: 'Door with 2 Sidelites',
    category: 'entry',
    labour: 1560.0,
    misc: 194.4,
    description: 'Steel Single Entry door with Two sidelite',
  },
  {
    id: 'garden_terrace_double',
    label: 'Garden / Terrace / Double Door',
    category: 'garden',
    labour: 1560.0,
    misc: 194.4,
    description: 'Steel Garden Door',
  },
  {
    id: 'patio_5ft',
    label: "5' Patio Door",
    category: 'patio',
    labour: 1040.0,
    misc: 162.0,
    description: 'Patio Door',
  },
  {
    id: 'patio_6ft',
    label: "6' Patio Door",
    category: 'patio',
    labour: 1040.0,
    misc: 194.4,
    description: 'Patio Door',
  },
  {
    id: 'patio_8ft',
    label: "8' Patio Door",
    category: 'patio',
    labour: 1040.0,
    misc: 259.2,
    description: 'Patio Door',
  },
  {
    id: 'patio_3panel_9ft',
    label: "3 Panel Patio Door 9'",
    category: 'patio',
    labour: 1062.0,
    misc: 291.6,
    description: 'Patio Door with 3-panel sliding system',
  },
  {
    id: 'patio_panel_12ft',
    label: "3 or 4 Patio Panel Door 12'",
    category: 'patio',
    labour: 1416.0,
    misc: 388.8,
    description: 'Patio Door with 3 or 4 panel sliding system',
  },
  {
    id: 'patio_panel_16ft',
    label: "3 or 4 Patio Panel Door 16'",
    category: 'patio',
    labour: 1888.0,
    misc: 518.4,
    description: 'Patio Door with 3 or 4 panel sliding system',
  },
  {
    id: 'storm_same_time',
    label: 'Storm Door (Same Time as Door)',
    category: 'storm',
    labour: 175.0,
    misc: 0.0,
    description: 'Self Storing Storm Door',
  },
  {
    id: 'storm_only',
    label: 'Storm Door Only (Stand-alone)',
    category: 'storm',
    labour: 335.0,
    misc: 0.0,
    description: 'Self Storing Storm Door',
  },
  {
    id: 'custom_door',
    label: 'Custom Door Configuration',
    category: 'custom',
    labour: 715.0,
    misc: 115.2,
    description: 'Custom Door',
    isCustom: true,
  },
];

export const DEFAULT_DOOR_UPCHARGES: DoorUpchargeConfig[] = [
  {
    id: 'siding_removal',
    label: 'Removal or cutting of siding',
    rate: 130.0,
    unit: '1 Hour',
    description: 'Siding modification/cutting for brick mould or frame clearance',
  },
  {
    id: 'bm_build_up',
    label: 'If BM needs to be built up',
    rate: 130.0,
    unit: '1 Hour',
    description: 'Brick mould extension or build-up to bridge wall depth',
  },
  {
    id: 'jambs_added',
    label: 'If interior of jambs needs to be added to',
    rate: 130.0,
    unit: '1 Hour',
    description: 'Jamb extensions on non-standard interior reveals',
  },
  {
    id: 'casing_wide',
    label: 'If interior Casings are wider than 3.25"',
    rate: 130.0,
    unit: '1 Hour',
    description: 'Custom wide trim/casing installation and carpentry fitting',
  },
  {
    id: 'customer_db_ls',
    label: 'If customer supplied DB & or LS',
    rate: 80.0,
    unit: 'per each door',
    description: 'Preparation and installation of customer-provided deadbolt and lockset',
  },
  {
    id: 'concrete_wall',
    label: 'If into concrete wall some or all height',
    rate: 162.5,
    unit: '1.25 Hours',
    description: 'Masonry tapcon anchoring into concrete foundation or block',
  },
  {
    id: 'frame_narrower',
    label: 'If Patio door or door need to frame narrower',
    rate: 162.5,
    unit: '1.25 Hours',
    description: 'Rough opening reframing to fit a narrower door unit',
  },
];

export const DEFAULT_DOOR_FORMULA: DoorFormulaSettings = {
  surchargeRate: 8, // 8% manufacturer surcharge
  doorDiscountPercent: 10, // 10% standard door discount (except storm)
  locksetDeadboltPrice: 158.0, // $158 standard lockset & deadbolt
  customerSuppliedHardwareFee: 80.0, // $80 install customer hardware
};

export const DEFAULT_DOOR_LOGISTICS: DoorLogisticsSettings = {
  setupFeeDefault: 140.0, // $140 local setup
  setupFeeFarStandard: 727.5, // $727.50 Dryden / Sioux Lookout
  setupFeeFarSmall: 363.5, // $363.50 Far small
  vehicleRatePerKm: 0.98, // $0.98 / km
  crewHourly2Men: 150.0, // $150 / hr (2 men)
  crewHourly3Men: 200.0, // $200 / hr (3 men)
};

export const DEFAULT_DOOR_SETTINGS_DATA: IDoorSettingsData = {
  presets: DEFAULT_DOOR_PRESETS,
  upcharges: DEFAULT_DOOR_UPCHARGES,
  formula: DEFAULT_DOOR_FORMULA,
  logistics: DEFAULT_DOOR_LOGISTICS,
};

