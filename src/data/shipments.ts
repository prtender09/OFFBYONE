export type ShipmentStatus = 'In Transit' | 'Delayed' | 'SLA Risk' | 'Delivered';

export interface Milestone {
  name: string;
  location: string;
  timestamp: string;
  completed: boolean;
  current?: boolean;
}

export interface ExceptionDetails {
  title: string;
  category: 'Customs & Port' | 'Temperature Excursion' | 'Weather & Traffic' | 'Mechanical Failure' | 'Documentation';
  severity: 'Critical' | 'High' | 'Moderate';
  reportedAt: string;
  slaDeadline: string;
  timeRemainingOrElapsed: string;
  rootCause: string;
  cargoImpact: string;
  financialRisk: string;
  recommendation: {
    id: string;
    actionTitle: string;
    summary: string;
    detailedPlan: string[];
    recoveredHours: string;
    estimatedCost: string;
    confidenceScore: number;
    recommendedCarrier?: string;
  };
  approved?: boolean;
  approvedAt?: string;
  approvedBy?: string;
}

export interface LiveTelemetry {
  speedKmH: number;
  temperatureC?: number;
  engineRpm?: number;
  fuelOrBatteryPercent: number;
  altitudeMeters?: number;
  lastPingSecondsAgo: number;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  origin: {
    city: string;
    stateOrCountry: string;
    facility: string;
    coordinates: [number, number];
  };
  destination: {
    city: string;
    stateOrCountry: string;
    facility: string;
    coordinates: [number, number];
  };
  currentLocation: {
    name: string;
    coordinates: [number, number];
    updatedAt: string;
  };
  carrier: {
    name: string;
    serviceType: string;
    vehicleId: string;
    driverName?: string;
  };
  status: ShipmentStatus;
  progressPercent: number;
  cargo: {
    description: string;
    category: string;
    weight: string;
    declaredValue: string;
    specialHandling?: string;
  };
  schedule: {
    departureTime: string;
    originalEta: string;
    currentEta: string;
    delayDuration?: string;
  };
  milestones: Milestone[];
  exception?: ExceptionDetails;
  liveTelemetry: LiveTelemetry;
}

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: 'shp-1',
    trackingNumber: 'OBO-8921-XPR',
    origin: {
      city: 'Mumbai',
      stateOrCountry: 'Maharashtra, India',
      facility: 'JNPT Port Terminal (Nhava Sheva)',
      coordinates: [18.9553, 72.9492]
    },
    destination: {
      city: 'Delhi NCR',
      stateOrCountry: 'New Delhi, India',
      facility: 'ICD Tughlakabad Container Gateway',
      coordinates: [28.5028, 77.2917]
    },
    currentLocation: {
      name: 'Surat WDFC Staging Yard, Gujarat',
      coordinates: [21.1702, 72.8311],
      updatedAt: '3s ago'
    },
    carrier: {
      name: 'CONCOR / Indian Railways DFC',
      serviceType: 'Western Dedicated Freight Corridor (WDFC)',
      vehicleId: 'RAKE-WDFC-9042',
      driverName: 'Lead Loco Pilot Rajesh Sharma'
    },
    status: 'Delayed',
    progressPercent: 34,
    cargo: {
      description: 'High-Density Solid-State Server Racks & AI Accelerators',
      category: 'Critical Infrastructure Electronics',
      weight: '14,200 kg',
      declaredValue: '₹3,48,00,000',
      specialHandling: 'Shock-Sensitive • Air-Ride Suspension Required'
    },
    schedule: {
      departureTime: 'Oct 02, 2026 • 06:30 AM IST',
      originalEta: 'Oct 03, 2026 • 09:00 AM IST',
      currentEta: 'Oct 04, 2026 • 02:00 PM IST',
      delayDuration: '+29 hours'
    },
    milestones: [
      { name: 'Port Manifest Customs Release', location: 'JNPT Port Pier 4, Navi Mumbai', timestamp: 'Oct 02, 06:30 AM', completed: true },
      { name: 'Western DFC Intermodal Gate', location: 'Sanpada Rail Yard, Navi Mumbai', timestamp: 'Oct 02, 11:15 AM', completed: true },
      { name: 'Electric Traction Rail Yard', location: 'Surat WDFC Yard, Gujarat', timestamp: 'Oct 02, 08:45 PM', completed: false, current: true },
      { name: 'Rewari Logistics Interchange', location: 'Rewari Junction, Haryana', timestamp: 'Pending', completed: false },
      { name: 'ICD Tughlakabad Delivery', location: 'ICD Tughlakabad, New Delhi', timestamp: 'Oct 04, 02:00 PM', completed: false }
    ],
    exception: {
      title: 'Western DFC Rail Gridlock & Gantry Crane Breakdown',
      category: 'Customs & Port',
      severity: 'Critical',
      reportedAt: 'Oct 02, 2026 • 10:14 PM IST',
      slaDeadline: 'Oct 03, 2026 • 12:00 PM IST',
      timeRemainingOrElapsed: 'SLA Breached by 15h 40m',
      rootCause: 'Severe hydraulic gantry crane breakdown at Surat WDFC Freight Interchange created an 18-hour rake blockage. High-speed Dedicated Freight Corridor train path slot was forfeited, postponing container dispatch towards Rewari by 36 hours.',
      cargoImpact: 'Noida Hyper-scale Data Center expansion project stalled. Contractual penalty clause accrues at ₹2,90,000/hour beyond SLA delivery deadline.',
      financialRisk: '₹43,50,000 SLA Penalty Exposure',
      recommendation: {
        id: 'REC-8921-HOTSHOT',
        actionTitle: 'Authorize Express Hotshot Drayage Intercept via NH-48',
        summary: 'Decouple container at Surat WDFC Yard and dispatch dual-driver expedited multi-axle Volvo trailer directly to Noida via NH-48 Express Corridor.',
        detailedPlan: [
          'Issue emergency decoupling order to Surat WDFC Terminal Operations with Indian Customs transit seal.',
          'Dispatch Blue Dart Surface Express multi-axle team with FASTag express priority passage.',
          'Bypass congested rail choke-points to deliver directly to Greater Noida Tech Zone by Oct 3 at 11:30 PM.',
          'Continuous IoT telematics beacon streaming via NavIC/GPS satellite network.'
        ],
        recoveredHours: '24.5 hours recovered',
        estimatedCost: '+₹1,20,000 Express Surcharge',
        confidenceScore: 96,
        recommendedCarrier: 'Blue Dart Surface Express / VRL Logistics'
      },
      approved: false
    },
    liveTelemetry: {
      speedKmH: 0,
      fuelOrBatteryPercent: 88,
      lastPingSecondsAgo: 3
    }
  },
  {
    id: 'shp-2',
    trackingNumber: 'OBO-9044-MED',
    origin: {
      city: 'Hyderabad',
      stateOrCountry: 'Telangana, India',
      facility: 'Genome Valley Biopharma Cold Vault (RGIA)',
      coordinates: [17.2403, 78.4294]
    },
    destination: {
      city: 'Bengaluru',
      stateOrCountry: 'Karnataka, India',
      facility: 'Electronic City Biotech Research Hub (KIA)',
      coordinates: [13.1986, 77.7066]
    },
    currentLocation: {
      name: 'Deccan Airway Corridor (FL280 - Kurnool, AP)',
      coordinates: [15.8281, 78.0373],
      updatedAt: '2s ago'
    },
    carrier: {
      name: 'IndiGo CarGo / Blue Dart Aviation',
      serviceType: 'Active Temperature Air Freight (A321-P2F)',
      vehicleId: 'Flight 6E-8804 (Airbus A321 Freighter)',
      driverName: 'Capt. Aditi Verma'
    },
    status: 'SLA Risk',
    progressPercent: 74,
    cargo: {
      description: 'Lyophilized Pediatric Oncology Biologics & Vaccines',
      category: 'Cold-Chain Pharmaceuticals (2°C - 8°C)',
      weight: '1,850 kg',
      declaredValue: '₹5,64,00,000',
      specialHandling: 'Active Cryo-Temp Sensor • CDSCO Class-A Critical'
    },
    schedule: {
      departureTime: 'Oct 03, 2026 • 01:10 AM IST',
      originalEta: 'Oct 03, 2026 • 04:30 PM IST',
      currentEta: 'Oct 03, 2026 • 07:15 PM IST',
      delayDuration: '+2h 45m (Risk)'
    },
    milestones: [
      { name: 'Cold Vault Dispatch', location: 'Genome Valley, Shamshabad, Hyderabad', timestamp: 'Oct 03, 01:10 AM', completed: true },
      { name: 'Air Freight Departure', location: 'RGIA Hyderabad Runway 09R', timestamp: 'Oct 03, 02:45 AM', completed: true },
      { name: 'Deccan Waypoint Bravo', location: 'Rayalaseema Air Sector, AP', timestamp: 'Oct 03, 06:15 AM', completed: false, current: true },
      { name: 'Airside Tarmac Receiving', location: 'KIA Cargo Terminal, Bengaluru', timestamp: 'Oct 03, 07:15 PM (Est)', completed: false },
      { name: 'Cold Vault Dock Delivery', location: 'Electronic City Phase 1, Bengaluru', timestamp: 'Oct 03, 08:45 PM (Est)', completed: false }
    ],
    exception: {
      title: 'Monsoon Headwinds & Dry Ice Sublimation Threshold',
      category: 'Temperature Excursion',
      severity: 'Critical',
      reportedAt: 'Oct 03, 2026 • 06:30 AM IST',
      slaDeadline: 'Oct 03, 2026 • 08:30 PM IST',
      timeRemainingOrElapsed: '1h 15m buffer before thermal breach',
      rootCause: 'Severe convective monsoon storm cell over the Rayalaseema corridor forced flight holding and detour. Active IoT logger Pod-B reports container core temperature trending up to +5.4°C (nominal 3.5°C), signaling accelerated dry ice sublimation.',
      cargoImpact: 'Temperature excursion beyond +8.0°C will trigger total biological invalidation under CDSCO regulatory norms, resulting in complete batch disposal.',
      financialRisk: '₹5,64,00,000 Cargo Write-off Risk',
      recommendation: {
        id: 'REC-9044-CRYO',
        actionTitle: 'Deploy Airside Cryo Recharge & Green Corridor Police Escort',
        summary: 'Position emergency liquid nitrogen mobile recharging unit at KIA Bengaluru Bay 14 and execute priority tarmac customs green-corridor clearance.',
        detailedPlan: [
          'Pre-position CryoTrans India liquid nitrogen recharge vehicle at KIA Cargo Bay 14 before Flight 6E touchdown.',
          'Execute immediate airside tarmac offload with authorized cold-chain tarmac rapid response crew.',
          'Recharge coolant canisters and verify multi-channel data logger calibration within 12 minutes of landing.',
          'Green-Corridor police-escorted refrigerated vehicle direct to Electronic City Biotech Vault.'
        ],
        recoveredHours: '100% Thermal Safety Restored',
        estimatedCost: '+₹68,000 Cryo Ground Response',
        confidenceScore: 99,
        recommendedCarrier: 'CryoTrans India Logistics'
      },
      approved: false
    },
    liveTelemetry: {
      speedKmH: 865,
      temperatureC: 5.4,
      altitudeMeters: 8530,
      fuelOrBatteryPercent: 62,
      lastPingSecondsAgo: 2
    }
  },
  {
    id: 'shp-3',
    trackingNumber: 'OBO-7731-TRK',
    origin: {
      city: 'Chennai',
      stateOrCountry: 'Tamil Nadu, India',
      facility: 'Sriperumbudur Auto-Tech Corridor Hub',
      coordinates: [12.9818, 79.9405]
    },
    destination: {
      city: 'Pune',
      stateOrCountry: 'Maharashtra, India',
      facility: 'Chakan Industrial Auto Cluster',
      coordinates: [18.7606, 73.8596]
    },
    currentLocation: {
      name: 'NH-48 Golden Quadrilateral (Near Belagavi, KA)',
      coordinates: [15.8497, 74.4977],
      updatedAt: '4s ago'
    },
    carrier: {
      name: 'TCI Freight (Transport Corp of India)',
      serviceType: 'Heavy Industrial Express FTL',
      vehicleId: 'TRK-TCI-7731 (Tata Prima 5530.S)',
      driverName: 'Gurpreet Singh'
    },
    status: 'In Transit',
    progressPercent: 68,
    cargo: {
      description: 'Autonomous Warehouse AGV Robotics & Lithium Battery Packs',
      category: 'Industrial Automation',
      weight: '16,400 kg',
      declaredValue: '₹2,40,00,000',
      specialHandling: 'Class 9 HazMat Packaging • Tilt-Watch'
    },
    schedule: {
      departureTime: 'Oct 02, 2026 • 04:00 PM IST',
      originalEta: 'Oct 04, 2026 • 11:30 AM IST',
      currentEta: 'Oct 04, 2026 • 10:45 AM IST',
      delayDuration: 'On Schedule (-45m early)'
    },
    milestones: [
      { name: 'Depot Dispatch', location: 'Sriperumbudur Hub, Tamil Nadu', timestamp: 'Oct 02, 04:00 PM', completed: true },
      { name: 'Hosur Border Checkpoint', location: 'Hosur Toll Plaza, TN-KA Border', timestamp: 'Oct 02, 07:20 PM', completed: true },
      { name: 'Belagavi Highway Sector', location: 'NH-48 Corridor, Belagavi, Karnataka', timestamp: 'Oct 03, 08:30 AM', completed: false, current: true },
      { name: 'Kolhapur Weigh Station', location: 'Kolhapur Toll, Maharashtra', timestamp: 'Oct 03, 07:00 PM (Est)', completed: false },
      { name: 'Chakan Assembly Gate', location: 'Chakan Industrial Hub, Pune', timestamp: 'Oct 04, 10:45 AM (Est)', completed: false }
    ],
    liveTelemetry: {
      speedKmH: 86,
      fuelOrBatteryPercent: 74,
      engineRpm: 1480,
      lastPingSecondsAgo: 4
    }
  },
  {
    id: 'shp-4',
    trackingNumber: 'OBO-6482-FLT',
    origin: {
      city: 'Kolkata',
      stateOrCountry: 'West Bengal, India',
      facility: 'Dankuni Multi-Modal Logistics Hub',
      coordinates: [22.6845, 88.2936]
    },
    destination: {
      city: 'Ahmedabad',
      stateOrCountry: 'Gujarat, India',
      facility: 'Sanand Industrial Mega Park',
      coordinates: [22.9868, 72.3813]
    },
    currentLocation: {
      name: 'NH-19 / NH-27 Corridor (Near Varanasi, UP)',
      coordinates: [25.3176, 82.9739],
      updatedAt: '1s ago'
    },
    carrier: {
      name: 'Gati-KWE Dedicated Express',
      serviceType: 'Dedicated Air-Suspension FTL',
      vehicleId: 'WB-02-6482 (BharatBenz 2823R)',
      driverName: 'Manish Pandey'
    },
    status: 'In Transit',
    progressPercent: 52,
    cargo: {
      description: 'Festive Season Electronics & Consumer Retail Inventory',
      category: 'Consumer Retail Merchandise',
      weight: '12,600 kg',
      declaredValue: '₹1,20,00,000',
      specialHandling: 'Moisture-Proof Pallet Wrap'
    },
    schedule: {
      departureTime: 'Oct 03, 2026 • 03:00 AM IST',
      originalEta: 'Oct 04, 2026 • 08:30 AM IST',
      currentEta: 'Oct 04, 2026 • 08:15 AM IST',
      delayDuration: 'On Schedule (-15m)'
    },
    milestones: [
      { name: 'Dankuni Hub Loading', location: 'Dankuni Logistics Park, Kolkata', timestamp: 'Oct 03, 03:00 AM', completed: true },
      { name: 'Durgapur Express Passage', location: 'Durgapur Toll, West Bengal', timestamp: 'Oct 03, 06:45 AM', completed: true },
      { name: 'Varanasi Bypass Waypoint', location: 'NH-19 Corridor, Varanasi, UP', timestamp: 'Oct 03, 11:30 AM', completed: false, current: true },
      { name: 'Kanpur Central Checkpoint', location: 'Kanpur Bypass, UP', timestamp: 'Oct 03, 05:00 PM (Est)', completed: false },
      { name: 'Sanand Estate Gateway', location: 'Sanand GIDC, Ahmedabad', timestamp: 'Oct 04, 08:15 AM (Est)', completed: false }
    ],
    liveTelemetry: {
      speedKmH: 92,
      fuelOrBatteryPercent: 81,
      engineRpm: 1550,
      lastPingSecondsAgo: 1
    }
  },
  {
    id: 'shp-5',
    trackingNumber: 'OBO-5190-LCL',
    origin: {
      city: 'Ahmedabad',
      stateOrCountry: 'Gujarat, India',
      facility: 'Changodar GIDC Logistics Hub',
      coordinates: [22.9130, 72.4410]
    },
    destination: {
      city: 'Surat',
      stateOrCountry: 'Gujarat, India',
      facility: 'Hazira Port Industrial Complex',
      coordinates: [21.0975, 72.6513]
    },
    currentLocation: {
      name: 'Hazira Port Logistics Hub Dock 4B, Surat',
      coordinates: [21.0975, 72.6513],
      updatedAt: 'Delivered'
    },
    carrier: {
      name: 'Mahindra Logistics Priority',
      serviceType: 'Intra-State LTL Express',
      vehicleId: 'GJ-05-3109 (Mahindra Furio 14)',
      driverName: 'Hitesh Patel'
    },
    status: 'Delivered',
    progressPercent: 100,
    cargo: {
      description: 'Microgrid Commercial Solar & Battery Modules',
      category: 'Renewable Clean Energy',
      weight: '8,200 kg',
      declaredValue: '₹1,53,00,000',
      specialHandling: 'Heavy Equipment Forklift Required'
    },
    schedule: {
      departureTime: 'Oct 02, 2026 • 08:00 PM IST',
      originalEta: 'Oct 03, 2026 • 07:30 AM IST',
      currentEta: 'Oct 03, 2026 • 07:12 AM IST',
      delayDuration: 'Delivered Ahead of Time (-18m)'
    },
    milestones: [
      { name: 'Changodar Depot Departure', location: 'Changodar GIDC, Ahmedabad', timestamp: 'Oct 02, 08:00 PM', completed: true },
      { name: 'Vadodara Expressway Check', location: 'NE-1 Vadodara Toll, Gujarat', timestamp: 'Oct 03, 01:45 AM', completed: true },
      { name: 'Bharuch Narmada Bridge', location: 'Golden Bridge Sector, Bharuch', timestamp: 'Oct 03, 05:10 AM', completed: true },
      { name: 'Surat City Approach', location: 'Ring Road Junction, Surat', timestamp: 'Oct 03, 06:50 AM', completed: true },
      { name: 'Signed Proof of Delivery', location: 'Hazira Dock 4B, Surat', timestamp: 'Oct 03, 07:12 AM', completed: true }
    ],
    liveTelemetry: {
      speedKmH: 0,
      fuelOrBatteryPercent: 94,
      lastPingSecondsAgo: 0
    }
  }
];
